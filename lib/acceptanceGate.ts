import type { Episode, QualityCriteria } from "./types";

export type Verdict = "accepted" | "rejected";

export interface Suggestion {
  verdict: Verdict;
  borderline: boolean;
}

/** Evaluate an episode against the campaign's thresholds. */
export function suggestVerdict(ep: Episode, crit: QualityCriteria): Verdict {
  const { handVisibilityPct, avgConfidence, framingOk } = ep.qualityMetrics;
  if (handVisibilityPct < crit.minHandVisibilityPct) return "rejected";
  if (avgConfidence < crit.minTrackingConfidence) return "rejected";
  if (crit.requireFraming && !framingOk) return "rejected";
  return "accepted";
}

/**
 * Borderline = any metric is within its margin band around a threshold.
 * These episodes warrant a human eye regardless of pass/fail.
 */
export function isBorderline(ep: Episode, crit: QualityCriteria): boolean {
  const { handVisibilityPct, avgConfidence } = ep.qualityMetrics;
  return (
    Math.abs(handVisibilityPct - crit.minHandVisibilityPct) < 10 ||
    Math.abs(avgConfidence - crit.minTrackingConfidence) < 0.05
  );
}

export function getSuggestion(ep: Episode, crit: QualityCriteria): Suggestion {
  return { verdict: suggestVerdict(ep, crit), borderline: isBorderline(ep, crit) };
}

export interface GateDecision {
  episodeId: string;
  nextStatus: Episode["qaStatus"];
}

/**
 * Apply reviewPolicy to a batch of pending episodes.
 * Returns only episodes whose status should change.
 */
export function applyGate(
  episodes: Episode[],
  criteriaMap: Record<string, QualityCriteria>
): GateDecision[] {
  const out: GateDecision[] = [];

  for (const ep of episodes) {
    if (ep.qaStatus !== "pending") continue;
    const crit = criteriaMap[ep.campaignId];
    if (!crit) continue;

    const verdict = suggestVerdict(ep, crit);
    const borderline = isBorderline(ep, crit);
    const policy = crit.reviewPolicy;

    let next: Episode["qaStatus"];

    if (policy === "auto") {
      next = verdict;
    } else if (policy === "sample") {
      if (verdict === "rejected") {
        next = "rejected";
      } else if (borderline) {
        next = "pending"; // always flag borderline
      } else {
        // Clear pass: sample ~25% for manual review via deterministic hash
        next = stableHash(ep.id) % 4 === 0 ? "pending" : "accepted";
      }
    } else {
      // "full" — leave all for manual review
      next = "pending";
    }

    if (next !== "pending") out.push({ episodeId: ep.id, nextStatus: next });
  }

  return out;
}

/** Stable integer hash of a string (djb2 variant). */
function stableHash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) ^ s.charCodeAt(i)) >>> 0;
  return h;
}
