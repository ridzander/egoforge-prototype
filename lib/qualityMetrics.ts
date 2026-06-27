import type { HandLandmarkerResult } from "@mediapipe/tasks-vision";
import type { EpisodeQualityMetrics } from "./types";

/** Landmarks must be within [MARGIN, 1-MARGIN] to count as framed. */
const FRAME_MARGIN = 0.05;

export interface QualitySignals {
  handsVisible: {
    count: number;
    required: number;
    ok: boolean;
  };
  trackingConfidence: {
    /** Mean handedness category score across detected hands (0–1). */
    value: number;
    threshold: number;
    ok: boolean;
  };
  framingOk: boolean;
}

export interface AccumulatedStats {
  totalFrames: number;
  framesWithRequiredHands: number;
  confidenceSum: number;
  confidenceFrames: number; // frames that had ≥1 hand (denominator for avgConfidence)
  framesFramingOk: number;
}

export function emptyAccumulated(): AccumulatedStats {
  return {
    totalFrames: 0,
    framesWithRequiredHands: 0,
    confidenceSum: 0,
    confidenceFrames: 0,
    framesFramingOk: 0,
  };
}

export function computeFrameSignals(
  result: HandLandmarkerResult,
  bimanual: boolean,
  minTrackingConfidence: number
): QualitySignals {
  const count = result.landmarks.length;
  const required = bimanual ? 2 : 1;

  // Mean handedness score across all detected hands
  let confidenceValue = 0;
  if (count > 0) {
    let sum = 0;
    for (const handedness of result.handedness) {
      sum += handedness[0]?.score ?? 0;
    }
    confidenceValue = sum / count;
  }

  // All landmarks must lie inside the central 90% of the frame
  let framingOk = true;
  if (count > 0) {
    outer: for (const lms of result.landmarks) {
      for (const lm of lms) {
        if (
          lm.x < FRAME_MARGIN ||
          lm.x > 1 - FRAME_MARGIN ||
          lm.y < FRAME_MARGIN ||
          lm.y > 1 - FRAME_MARGIN
        ) {
          framingOk = false;
          break outer;
        }
      }
    }
  }

  return {
    handsVisible: { count, required, ok: count >= required },
    trackingConfidence: {
      value: confidenceValue,
      threshold: minTrackingConfidence,
      // When no hands detected, confidence is meaningfully zero — mark fail
      ok: count > 0 && confidenceValue >= minTrackingConfidence,
    },
    framingOk,
  };
}

export function accumulateFrame(
  acc: AccumulatedStats,
  signals: QualitySignals,
  hasHands: boolean
): void {
  acc.totalFrames++;
  if (signals.handsVisible.ok) acc.framesWithRequiredHands++;
  if (signals.framingOk) acc.framesFramingOk++;
  if (hasHands) {
    acc.confidenceSum += signals.trackingConfidence.value;
    acc.confidenceFrames++;
  }
}

export function computeEpisodeMetrics(
  acc: AccumulatedStats
): EpisodeQualityMetrics {
  const { totalFrames, framesWithRequiredHands, confidenceSum, confidenceFrames, framesFramingOk } =
    acc;
  return {
    handVisibilityPct:
      totalFrames > 0
        ? Math.round((framesWithRequiredHands / totalFrames) * 1000) / 10
        : 0,
    avgConfidence:
      confidenceFrames > 0
        ? Math.round((confidenceSum / confidenceFrames) * 1000) / 1000
        : 0,
    framingOk: totalFrames > 0 ? framesFramingOk > totalFrames / 2 : false,
  };
}
