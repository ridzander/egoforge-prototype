import { FlaskConical } from "lucide-react";

export function PrototypeBanner() {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b bg-amber-50 px-4 py-1.5 dark:bg-amber-950/20">
      <FlaskConical className="size-3 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="text-[11px] leading-tight text-amber-800 dark:text-amber-300">
        <span className="font-semibold">Prototype. </span>
        <span className="text-amber-700/80 dark:text-amber-400/80">
          Real: webcam capture · MediaPipe hand tracking · quality metrics · IndexedDB persistence · coverage analytics.
          {"  "}Simulated: device tiers · SLAM/camera pose · multi-site sync.
        </span>
      </p>
    </div>
  );
}
