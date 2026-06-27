"use client";

import { useEffect, useRef, useState } from "react";
import type { HandLandmarkerResult } from "@/lib/handTracker";
import {
  computeFrameSignals,
  accumulateFrame,
  computeEpisodeMetrics,
  emptyAccumulated,
  type QualitySignals,
  type AccumulatedStats,
} from "@/lib/qualityMetrics";

const SAMPLE_INTERVAL_MS = 100;

export interface UseQualityMetricsResult {
  signals: QualitySignals | null;
  getEpisodeMetrics: () => ReturnType<typeof computeEpisodeMetrics>;
}

export function useQualityMetrics(
  latestResultRef: React.RefObject<HandLandmarkerResult | null>,
  isRecording: boolean,
  bimanual: boolean,
  minTrackingConfidence: number
): UseQualityMetricsResult {
  const [signals, setSignals] = useState<QualitySignals | null>(null);

  const accRef = useRef<AccumulatedStats>(emptyAccumulated());
  const prevRecordingRef = useRef(false);
  const isRecordingRef = useRef(isRecording);
  isRecordingRef.current = isRecording;
  const bimanualRef = useRef(bimanual);
  bimanualRef.current = bimanual;
  const thresholdRef = useRef(minTrackingConfidence);
  thresholdRef.current = minTrackingConfidence;

  useEffect(() => {
    const id = setInterval(() => {
      // Detect recording start → reset accumulator
      if (isRecordingRef.current && !prevRecordingRef.current) {
        accRef.current = emptyAccumulated();
      }
      prevRecordingRef.current = isRecordingRef.current;

      const result = latestResultRef.current;
      if (!result) return;

      const s = computeFrameSignals(result, bimanualRef.current, thresholdRef.current);
      setSignals(s);

      if (isRecordingRef.current) {
        accumulateFrame(accRef.current, s, s.handsVisible.count > 0);
      }
    }, SAMPLE_INTERVAL_MS);

    return () => clearInterval(id);
  }, []); // stable — reads everything via refs

  const getEpisodeMetrics = () => computeEpisodeMetrics(accRef.current);

  return { signals, getEpisodeMetrics };
}
