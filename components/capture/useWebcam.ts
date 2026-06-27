"use client";

import { useEffect, useRef, useState } from "react";

export type CameraStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "unavailable"
  | "error";

export interface UseWebcamResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  status: CameraStatus;
  errorMessage: string | null;
  retry: () => void;
}

export function useWebcam(): UseWebcamResult {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("requesting");
    setErrorMessage(null);

    // Guard: camera API requires HTTPS or localhost
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      setErrorMessage("Camera API not available. Ensure the page is served over HTTPS.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) videoRef.current.srcObject = s;
        setStream(s);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const name = err instanceof DOMException ? err.name : "";
        const message = err instanceof Error ? err.message : "Unknown error";

        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setStatus("denied");
        } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
          setStatus("unavailable");
          setErrorMessage("No camera found. Connect a camera and retry.");
        } else if (name === "NotReadableError" || name === "TrackStartError") {
          setStatus("error");
          setErrorMessage("Camera is in use by another application. Close it and retry.");
        } else if (name === "OverconstrainedError") {
          setStatus("error");
          setErrorMessage("Camera does not support the requested constraints.");
        } else {
          setStatus("error");
          setErrorMessage(message);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  // Stop tracks on unmount or when stream changes
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  return {
    videoRef,
    stream,
    status,
    errorMessage,
    retry: () => setAttempt((n) => n + 1),
  };
}
