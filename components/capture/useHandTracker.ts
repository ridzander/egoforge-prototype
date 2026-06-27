"use client";

import { useEffect, useRef, useState } from "react";
import {
  getHandLandmarker,
  HAND_CONNECTIONS,
  type HandLandmarkerResult,
} from "@/lib/handTracker";

export type TrackerStatus = "loading" | "ready" | "error";

export interface UseHandTrackerResult {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  latestResultRef: React.RefObject<HandLandmarkerResult | null>;
  trackerStatus: TrackerStatus;
}

// ─── drawing ──────────────────────────────────────────────────────────────────

const RIGHT_COLOR = "#60a5fa"; // blue-400  — mirror-right = user's left hand in egocentric view
const LEFT_COLOR = "#fb923c";  // orange-400

function drawHands(
  ctx: CanvasRenderingContext2D,
  result: HandLandmarkerResult,
  w: number,
  h: number
): void {
  for (let i = 0; i < result.landmarks.length; i++) {
    const lms = result.landmarks[i];
    const label = result.handedness[i]?.[0]?.categoryName ?? "Left";
    const color = label === "Right" ? RIGHT_COLOR : LEFT_COLOR;

    // Skeleton connections
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.7;
    for (const { start, end } of HAND_CONNECTIONS) {
      const a = lms[start];
      const b = lms[end];
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x * w, a.y * h);
      ctx.lineTo(b.x * w, b.y * h);
      ctx.stroke();
    }

    // Landmark dots — slightly larger for finger tips (indices 4,8,12,16,20)
    const TIPS = new Set([4, 8, 12, 16, 20]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    lms.forEach((lm, idx) => {
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, TIPS.has(idx) ? 4.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  ctx.globalAlpha = 1;
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useHandTracker(
  videoRef: React.RefObject<HTMLVideoElement>,
  active: boolean
): UseHandTrackerResult {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const latestResultRef = useRef<HandLandmarkerResult | null>(null);
  const [trackerStatus, setTrackerStatus] = useState<TrackerStatus>("loading");
  const landmarkerRef = useRef<Awaited<ReturnType<typeof getHandLandmarker>> | null>(null);

  // ── initialize HandLandmarker once ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    getHandLandmarker()
      .then((lm) => {
        if (cancelled) return;
        landmarkerRef.current = lm;
        setTrackerStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setTrackerStatus("error");
      });
    return () => { cancelled = true; };
  }, []);

  // ── RAF detection + drawing loop ─────────────────────────────────────────────
  useEffect(() => {
    if (!active || trackerStatus !== "ready") return;

    let animId: number;
    let running = true;

    const tick = () => {
      if (!running) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const lm = landmarkerRef.current;

      if (!video || !canvas || !lm || video.readyState < 2) {
        animId = requestAnimationFrame(tick);
        return;
      }

      // Keep canvas resolution in sync with the video element's rendered size.
      // Using clientWidth/clientHeight means landmark coords (normalized to video
      // frame) map directly to display pixels — no coordinate transform needed
      // as long as aspect ratios match (which they do for typical webcams).
      const dw = video.clientWidth;
      const dh = video.clientHeight;
      if (canvas.width !== dw || canvas.height !== dh) {
        canvas.width = dw;
        canvas.height = dh;
      }

      const result = lm.detectForVideo(video, performance.now());
      latestResultRef.current = result;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, dw, dh);
        drawHands(ctx, result, dw, dh);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      // Clear canvas and stale result when loop stops
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      }
      latestResultRef.current = null;
    };
  }, [active, trackerStatus]); // videoRef is a stable ref object — no need in deps

  return { canvasRef, latestResultRef, trackerStatus };
}
