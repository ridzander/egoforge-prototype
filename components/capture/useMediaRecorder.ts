"use client";

import { useEffect, useRef, useState } from "react";

export type RecordingState = "idle" | "recording";

export interface UseMediaRecorderResult {
  recordingState: RecordingState;
  elapsedSec: number;
  start: () => void;
  stop: () => void;
}

const PREFERRED_MIME_TYPES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
  "video/mp4",
];

export function useMediaRecorder(
  stream: MediaStream | null,
  onBlob: (blob: Blob, durationSec: number) => void
): UseMediaRecorderResult {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [elapsedSec, setElapsedSec] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Always call the latest version of onBlob (avoids stale closure)
  const onBlobRef = useRef(onBlob);
  useEffect(() => { onBlobRef.current = onBlob; });

  function start() {
    if (!stream || recordingState === "recording") return;

    chunksRef.current = [];
    const mimeType =
      PREFERRED_MIME_TYPES.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
    const recorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : undefined
    );
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const durationSec =
        Math.round(((Date.now() - startTimeRef.current) / 1000) * 10) / 10;
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || "video/webm",
      });
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      setRecordingState("idle");
      setElapsedSec(0);
      onBlobRef.current(blob, durationSec);
    };

    startTimeRef.current = Date.now();
    recorder.start(200);
    setRecordingState("recording");

    tickRef.current = setInterval(() => {
      setElapsedSec(
        Math.round((Date.now() - startTimeRef.current) / 1000)
      );
    }, 500);
  }

  function stop() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
    };
  }, []);

  return { recordingState, elapsedSec, start, stop };
}
