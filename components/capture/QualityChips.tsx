"use client";

import type { QualitySignals } from "@/lib/qualityMetrics";

function chip(ok: boolean, warn: boolean, label: string) {
  const cls = ok
    ? "bg-emerald-500/80 text-white"
    : warn
    ? "bg-amber-400/80 text-black"
    : "bg-red-500/80 text-white";
  return (
    <span key={label} className={`rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

export function QualityChips({ signals }: { signals: QualitySignals | null }) {
  if (!signals) return null;

  const { handsVisible, trackingConfidence, framingOk } = signals;

  // Amber when confidence is within 80% of threshold (close to failing)
  const confWarn =
    !trackingConfidence.ok &&
    trackingConfidence.value >= trackingConfidence.threshold * 0.8;

  // Hands-visible chip: amber when one hand present but not enough (bimanual case)
  const handsWarn = !handsVisible.ok && handsVisible.count > 0;

  return (
    <div className="absolute left-2 top-2 flex flex-wrap gap-1">
      {chip(handsVisible.ok, handsWarn, `Hands ${handsVisible.count}/${handsVisible.required}`)}
      {chip(trackingConfidence.ok, confWarn, `Conf ${(trackingConfidence.value * 100).toFixed(0)}%`)}
      {chip(framingOk, false, "Framing")}
    </div>
  );
}
