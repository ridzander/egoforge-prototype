"use client";

import { cn } from "@/lib/utils";
import type { RecordingState } from "./useMediaRecorder";

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface RecordButtonProps {
  recordingState: RecordingState;
  elapsedSec: number;
  disabled: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function RecordButton({
  recordingState,
  elapsedSec,
  disabled,
  onStart,
  onStop,
}: RecordButtonProps) {
  const isRecording = recordingState === "recording";

  return (
    <div className="flex flex-col items-center gap-3">
      {/* REC indicator — space is always reserved so layout doesn't jump */}
      <div
        className={cn(
          "flex items-center gap-1.5 text-sm font-semibold transition-opacity duration-200",
          isRecording ? "opacity-100" : "opacity-0"
        )}
        aria-live="polite"
        aria-label={isRecording ? `Recording: ${formatTime(elapsedSec)}` : ""}
      >
        <span className="size-2 animate-pulse rounded-full bg-red-500" />
        <span className="tabular-nums text-red-500">
          REC {formatTime(elapsedSec)}
        </span>
      </div>

      {/* Circle button */}
      <button
        type="button"
        disabled={disabled && !isRecording}
        onClick={isRecording ? onStop : onStart}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        className={cn(
          "flex size-[4.5rem] items-center justify-center rounded-full border-[5px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
          isRecording
            ? "border-red-500 bg-red-500 hover:bg-red-600 active:scale-95"
            : disabled
            ? "cursor-not-allowed border-muted bg-muted"
            : "border-primary bg-primary hover:opacity-90 active:scale-95"
        )}
      >
        {isRecording ? (
          // Stop icon — rounded square
          <span className="size-5 rounded-sm bg-white" />
        ) : (
          // Record icon — filled circle
          <span className="size-5 rounded-full bg-white" />
        )}
      </button>

      <p className="text-xs text-muted-foreground">
        {isRecording
          ? "Tap to stop"
          : disabled
          ? "Initializing…"
          : "Tap to record"}
      </p>
    </div>
  );
}
