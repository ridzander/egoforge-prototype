"use client";

import { AlertCircle, CameraOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QualityChips } from "./QualityChips";
import type { CameraStatus } from "./useWebcam";
import type { TrackerStatus } from "./useHandTracker";
import type { QualitySignals } from "@/lib/qualityMetrics";

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  status: CameraStatus;
  trackerStatus: TrackerStatus;
  errorMessage: string | null;
  onRetry: () => void;
  signals?: QualitySignals | null;
}

export function CameraPreview({
  videoRef,
  canvasRef,
  status,
  trackerStatus,
  errorMessage,
  onRetry,
  signals,
}: CameraPreviewProps) {
  const live = status === "ready";

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      {/* Video — always mounted so the ref is attached before the stream arrives */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
        style={{ opacity: live ? 1 : 0 }}
      />

      {/* Hand-tracking canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ opacity: live ? 1 : 0, pointerEvents: "none" }}
      />

      {/* Quality signal chips — top-left */}
      {live && <QualityChips signals={signals ?? null} />}

      {/* Tracker status — bottom-left, only while camera is live */}
      {live && trackerStatus === "loading" && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-[10px] text-white/80">
          <Loader2 className="size-3 animate-spin" />
          Initialising hand tracker…
        </div>
      )}
      {live && trackerStatus === "error" && (
        <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[10px] text-red-400">
          Hand tracking unavailable
        </div>
      )}

      {/* Full-screen overlay for non-ready camera states */}
      {!live && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          {status === "requesting" && (
            <>
              <Loader2 className="size-7 animate-spin text-white/60" />
              <p className="text-sm text-white/70">Requesting camera access…</p>
            </>
          )}

          {status === "denied" && (
            <>
              <CameraOff className="size-8 text-white/50" />
              <p className="text-sm font-semibold text-white">Camera access denied</p>
              <p className="max-w-xs text-xs text-white/60">
                Allow camera access in your browser or OS settings, then retry.
              </p>
              <Button size="sm" variant="secondary" onClick={onRetry}>
                Retry
              </Button>
            </>
          )}

          {status === "unavailable" && (
            <>
              <CameraOff className="size-8 text-white/50" />
              <p className="text-sm font-semibold text-white">No camera found</p>
              <p className="text-xs text-white/60">Connect a camera and retry.</p>
              <Button size="sm" variant="secondary" onClick={onRetry}>
                Retry
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="size-8 text-red-400" />
              <p className="text-sm font-semibold text-white">Camera error</p>
              {errorMessage && (
                <p className="max-w-xs text-xs text-white/60">{errorMessage}</p>
              )}
              <Button size="sm" variant="secondary" onClick={onRetry}>
                Retry
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
