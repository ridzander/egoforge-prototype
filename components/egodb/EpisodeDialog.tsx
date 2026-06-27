"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Minus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { Demonstrator, Episode, QualityCriteria, Scene, Task } from "@/lib/types";
import type { Suggestion } from "@/lib/acceptanceGate";

const QA_BADGE: Record<Episode["qaStatus"], string> = {
  pending:
    "border-border bg-muted text-muted-foreground",
  accepted:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  rejected:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300",
};

function MetricRow({
  label,
  actual,
  threshold,
  pass,
}: {
  label: string;
  actual: React.ReactNode;
  threshold?: React.ReactNode;
  pass?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 font-medium tabular-nums">
        {threshold !== undefined && (
          <span className="text-xs text-muted-foreground/60">min {threshold}</span>
        )}
        <span
          className={cn(
            pass === true && "text-emerald-600 dark:text-emerald-400",
            pass === false && "text-red-500 dark:text-red-400"
          )}
        >
          {actual}
        </span>
      </div>
    </div>
  );
}

interface EpisodeDialogProps {
  episode: Episode;
  task: Task | undefined;
  scene: Scene | undefined;
  demonstrator: Demonstrator | undefined;
  criteria: QualityCriteria | undefined;
  suggestion: Suggestion | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EpisodeDialog({
  episode,
  task,
  scene,
  demonstrator,
  criteria,
  suggestion,
  open,
  onOpenChange,
}: EpisodeDialogProps) {
  // Live episode so QA status updates immediately
  const liveEpisode = useLiveQuery<Episode | undefined>(
    async () => db.episodes.get(episode.id),
    [episode.id]
  );
  const ep = liveEpisode ?? episode;

  // Blob → object URL lifecycle.
  // A ref tracks the live URL so the async .then() that fires after cleanup
  // can still revoke it, preventing leaks when the dialog closes quickly.
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const liveUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Revoke eagerly when dialog closes, regardless of async state
      if (liveUrlRef.current) {
        URL.revokeObjectURL(liveUrlRef.current);
        liveUrlRef.current = null;
      }
      setVideoUrl(null);
      return;
    }

    let cancelled = false;

    db.blobs.get(ep.videoBlobKey).then((record) => {
      if (cancelled || !record) return;
      // Revoke any previously created URL before replacing it
      if (liveUrlRef.current) URL.revokeObjectURL(liveUrlRef.current);
      const url = URL.createObjectURL(record.blob);
      liveUrlRef.current = url;
      setVideoUrl(url);
    });

    return () => {
      cancelled = true;
      if (liveUrlRef.current) {
        URL.revokeObjectURL(liveUrlRef.current);
        liveUrlRef.current = null;
        setVideoUrl(null);
      }
    };
  }, [ep.videoBlobKey, open]);

  function setQa(status: Episode["qaStatus"]) {
    db.episodes
      .update(ep.id, { qaStatus: status })
      .then(() => {
        if (status === "accepted") toast.success("Episode accepted");
        else toast("Episode rejected", { description: "Marked as rejected." });
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update status");
      });
  }

  const { handVisibilityPct, avgConfidence, framingOk } = ep.qualityMetrics;
  const trackingAvailable = ep.qualityMetrics.trackingAvailable !== false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" showCloseButton>
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 pr-8">
            {task?.name ?? "Episode"}
            <Badge
              variant="outline"
              className={cn("text-[11px] capitalize", QA_BADGE[ep.qaStatus])}
            >
              {ep.qaStatus}
            </Badge>
            {/* Suggestion badge — only shown when pending */}
            {ep.qaStatus === "pending" && suggestion && (
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 text-[11px]",
                  suggestion.verdict === "accepted"
                    ? "border-emerald-200/60 text-emerald-600 dark:text-emerald-400"
                    : "border-red-200/60 text-red-500 dark:text-red-400",
                  suggestion.borderline && "border-dashed"
                )}
              >
                {suggestion.verdict === "accepted" ? (
                  <Check className="size-3" />
                ) : (
                  <Minus className="size-3" />
                )}
                Suggested: {suggestion.borderline ? "borderline" : suggestion.verdict}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Video player */}
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          {videoUrl ? (
            <video src={videoUrl} controls className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-white/40">
              Loading video…
            </div>
          )}
        </div>

        {/* Metrics vs thresholds */}
        <div className="divide-y rounded-lg border px-3">
          <MetricRow label="Scene" actual={scene?.name ?? "—"} />
          <MetricRow label="Demonstrator" actual={demonstrator?.name ?? "—"} />
          <MetricRow label="Duration" actual={`${Math.round(ep.durationSec)}s`} />
          <MetricRow
            label="Hand visibility"
            actual={trackingAvailable ? `${Math.round(handVisibilityPct)}%` : "—"}
            threshold={trackingAvailable && criteria ? `${criteria.minHandVisibilityPct}%` : undefined}
            pass={trackingAvailable && criteria ? handVisibilityPct >= criteria.minHandVisibilityPct : undefined}
          />
          <MetricRow
            label="Avg confidence"
            actual={trackingAvailable ? `${(avgConfidence * 100).toFixed(0)}%` : "—"}
            threshold={
              trackingAvailable && criteria
                ? `${(criteria.minTrackingConfidence * 100).toFixed(0)}%`
                : undefined
            }
            pass={trackingAvailable && criteria ? avgConfidence >= criteria.minTrackingConfidence : undefined}
          />
          <MetricRow
            label="Framing"
            actual={
              !trackingAvailable ? "—" : framingOk ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <X className="size-4 text-red-400" />
              )
            }
            pass={
              trackingAvailable && criteria
                ? !criteria.requireFraming || framingOk
                : undefined
            }
          />
          {!trackingAvailable && (
            <MetricRow
              label="Tracking"
              actual={<span className="text-amber-500 dark:text-amber-400">Unavailable at record time</span>}
            />
          )}
          <MetricRow
            label="Recorded"
            actual={new Date(ep.createdAt).toLocaleString()}
          />
        </div>

        {/* QA actions */}
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            disabled={ep.qaStatus === "rejected"}
            onClick={() => setQa("rejected")}
          >
            <X className="size-3.5" /> Reject
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            disabled={ep.qaStatus === "accepted"}
            onClick={() => setQa("accepted")}
          >
            <Check className="size-3.5" /> Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
