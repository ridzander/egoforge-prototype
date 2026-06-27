import Link from "next/link";
import { ArrowRight, Bot, Database, Gauge, Layers, Video } from "lucide-react";
import { HeroGlow } from "@/components/landing/HeroGlow";

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Studio", href: "/studio" },
  { label: "Capture", href: "/capture" },
  { label: "EgoDB", href: "/egodb" },
];

const CARDS = [
  {
    href: "/studio",
    icon: Layers,
    badge: "CONFIG LAYER",
    activeDot: true,
    title: "Studio",
    description:
      "The campaign builder. Define tasks with reset types, horizons, and object sets; set scene, device-tier, and diversity targets; and lock quality acceptance criteria.",
    cta: "Open Studio",
  },
  {
    href: "/capture",
    icon: Video,
    badge: "CAPTURE LAYER",
    activeDot: false,
    title: "Capture",
    description:
      "The demonstrator app. Record egocentric webcam demonstrations with live 21-keypoint hand tracking, real-time quality checkpoints, and dataset-unit progress.",
    cta: "Start capturing",
  },
  {
    href: "/egodb",
    icon: Database,
    badge: "DATA LAYER",
    activeDot: false,
    title: "EgoDB",
    description:
      "The dataset dashboard. Run episodes through the quality gate, track coverage across tasks, scenes, and demonstrators, and export training-ready manifests.",
    cta: "Open EgoDB",
  },
];

const METRICS = [
  { label: "Hand visibility", value: "92%", status: "OK", pct: 92 },
  { label: "Tracking confidence", value: "0.87", status: "STABLE", pct: 87 },
  { label: "Episodes accepted", value: "41 / 50", status: "PASS", pct: 82 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Mouse-tracking glow (client) */}
      <HeroGlow />

      {/* Subtle grid overlay */}
      <div className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/30 bg-background/80 shadow-[0_8px_32px_rgba(0,225,171,0.05)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-16">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            <span className="text-xl font-bold tracking-tight">EgoForge</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-mono text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <Link
            href="/studio"
            className="primary-glow-btn rounded-full px-6 py-2 font-mono text-sm font-bold"
          >
            Open Studio
          </Link>
        </div>
      </nav>

      <main className="relative pt-16">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center md:py-40">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-[52px] md:leading-[1.1]">
            Forge the data that teaches robots&nbsp;to&nbsp;manipulate
          </h1>
          <p className="mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            EgoForge is a task-configuration and data-collection platform for
            egocentric human demonstrations. Design collection campaigns, capture
            demonstrations with real-time hand tracking, and curate training-ready
            datasets — from a single lab to a distributed consortium.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/studio"
              className="primary-glow-btn rounded-full px-10 py-4 font-mono text-sm font-bold"
            >
              Open Studio
            </Link>
            <a
              href="#precision"
              className="rounded-full border border-border px-10 py-4 font-mono text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              See how it works
            </a>
          </div>
        </section>

        {/* ── Three cards ───────────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto mb-32 max-w-7xl px-6 md:px-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {CARDS.map(({ href, icon: Icon, badge, activeDot, title, description, cta }) => (
              <Link
                key={href}
                href={href}
                className="glass-card group flex flex-col rounded-xl p-8"
              >
                <div className="mb-6 flex items-center justify-between">
                  <Icon className="size-9 text-primary" />
                  <div className="flex items-center gap-2 rounded-full border border-border/30 bg-secondary px-3 py-1">
                    {activeDot && <span className="active-dot" />}
                    <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-primary">
                      {badge}
                    </span>
                  </div>
                </div>
                <h3 className="mb-4 text-2xl font-semibold">{title}</h3>
                <p className="flex-grow text-base leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <div className="mt-8 flex items-center justify-between border-t border-border/20 pt-8">
                  <span className="font-mono text-sm font-bold uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-primary">
                    {cta}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Real capture section ──────────────────────────────────────── */}
        <section
          id="precision"
          className="border-y border-border/20 bg-muted/30 px-6 py-24 md:px-16"
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center gap-16 md:flex-row">

              {/* Left: text */}
              <div className="flex-1">
                <h2 className="mb-6 text-3xl font-semibold leading-snug tracking-tight md:text-[32px]">
                  Real capture. Honest about the rest.
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                  EgoForge runs entirely in your browser. Capture and annotation
                  are real — your webcam is the egocentric camera and MediaPipe
                  provides genuine hand-pose tracking, so quality metrics are
                  computed, not faked. Device tiers, SLAM, and multi-site sync are
                  modeled in configuration to tell the full platform story.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded bg-primary/10 p-2">
                      <Gauge className="size-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">Real hand tracking</h4>
                      <p className="text-sm text-muted-foreground">
                        21 keypoints per hand via MediaPipe, driving live quality checkpoints.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded bg-primary/10 p-2">
                      <Layers className="size-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold">Simulated device tiers</h4>
                      <p className="text-sm text-muted-foreground">
                        Headset, glasses, and phone tiers modeled in Studio; the webcam is the capture device.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: telemetry panel */}
              <div className="w-full flex-1">
                <div className="glass-card relative overflow-hidden rounded-xl p-6">
                  <div className="mb-8 flex items-center justify-between">
                    <span className="font-mono text-sm font-medium tracking-tight text-primary">
                      SESSION_METRICS
                    </span>
                    <div className="flex gap-2">
                      <div className="size-3 rounded-full bg-red-500/50" />
                      <div className="size-3 rounded-full bg-yellow-500/50" />
                      <div className="size-3 rounded-full bg-green-500/50" />
                    </div>
                  </div>

                  <div className="space-y-5 font-mono text-xs">
                    {METRICS.map(({ label, value, status, pct }, i) => (
                      <div key={label}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="text-primary">
                            {value}{" "}
                            <span className="text-muted-foreground/60">[{status}]</span>
                          </span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full bg-primary${i === 0 ? " animate-pulse" : ""}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded border border-border/30 bg-background/80 p-4">
                    <code className="block font-mono text-xs text-primary">
                      &gt; egoforge export --top-v1
                    </code>
                    <code className="block font-mono text-xs text-muted-foreground/60">
                      &gt; manifest written: 41 episodes
                    </code>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/20 bg-background px-6 py-8 md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-primary" />
            <span className="text-sm font-bold">EgoForge</span>
          </div>
          <div className="flex gap-6">
            <a
              href="https://github.com/ridzander/egoforge-prototype"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-muted-foreground underline decoration-primary underline-offset-4 transition-colors hover:text-foreground"
            >
              GitHub repo
            </a>
            <Link
              href="/capture"
              className="font-mono text-xs text-muted-foreground underline decoration-primary underline-offset-4 transition-colors hover:text-foreground"
            >
              Demo
            </Link>
            <a
              href="#"
              className="font-mono text-xs text-muted-foreground underline decoration-primary underline-offset-4 transition-colors hover:text-foreground"
            >
              About
            </a>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 EgoForge · prototype</p>
        </div>
      </footer>
    </div>
  );
}
