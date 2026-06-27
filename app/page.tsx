import Link from "next/link";
import { Database, Layers, Video } from "lucide-react";

const LAYERS = [
  {
    href: "/studio",
    icon: Layers,
    label: "Studio",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-100 dark:border-violet-900",
    description:
      "Configure campaigns, tasks, scenes, device tiers, diversity quotas, and quality criteria. Everything a researcher needs to define a collection run.",
    cta: "Open Studio →",
  },
  {
    href: "/capture",
    icon: Video,
    label: "Capture",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-100 dark:border-blue-900",
    description:
      "Demonstrator interface with live webcam, real-time MediaPipe hand tracking, per-frame quality chips, and automatic episode saving to IndexedDB.",
    cta: "Start capturing →",
  },
  {
    href: "/egodb",
    icon: Database,
    label: "EgoDB",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-100 dark:border-indigo-900",
    description:
      "Review recorded episodes, run the quality-criteria acceptance gate, inspect the task × scene coverage heatmap, and export accepted metadata to JSON.",
    cta: "Browse EgoDB →",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 py-6">
      {/* Hero */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">EgoForge</h1>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
          A prototype platform for collecting egocentric human manipulation demonstrations
          used to train robot manipulation policies. Three integrated layers take you
          from campaign design through recording to dataset export.
        </p>
      </div>

      {/* Layer cards */}
      <div className="flex flex-col gap-4">
        {LAYERS.map(({ href, icon: Icon, label, color, bg, border, description, cta }) => (
          <Link
            key={href}
            href={href}
            className={`group flex gap-4 rounded-xl border p-5 transition-shadow hover:shadow-md ${border}`}
          >
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`size-5 ${color}`} />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
              <span className={`mt-1 text-xs font-medium ${color}`}>{cta}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Real vs simulated callout */}
      <div className="rounded-lg border border-dashed p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Real vs simulated
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">Real</p>
            <ul className="space-y-0.5 text-xs text-muted-foreground">
              <li>Webcam capture via getUserMedia</li>
              <li>MediaPipe 21-keypoint hand tracking</li>
              <li>Per-frame quality metrics from landmarks</li>
              <li>IndexedDB persistence (Dexie.js)</li>
              <li>Coverage analytics and acceptance gate</li>
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-amber-600 dark:text-amber-400">Simulated</p>
            <ul className="space-y-0.5 text-xs text-muted-foreground">
              <li>Device tiers (UI only, no hardware)</li>
              <li>SLAM / camera pose estimation</li>
              <li>Multi-site synchronisation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
