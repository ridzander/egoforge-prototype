"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/lib/hooks";
import type { Episode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EpisodeListProps {
  unitId: string | null;
  targetEpisodes: number;
}

export function EpisodeList({ unitId, targetEpisodes }: EpisodeListProps) {
  const episodes = useLiveQuery<Episode[]>(
    async () => {
      if (!unitId) return [];
      return db.episodes.where("unitId").equals(unitId).toArray();
    },
    [unitId],
    []
  );

  const count = episodes?.length ?? 0;
  const pct = targetEpisodes > 0 ? Math.min(1, count / targetEpisodes) : 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Episodes recorded</span>
        <span className="tabular-nums text-sm text-muted-foreground">
          {count} / {targetEpisodes}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            pct >= 1 ? "bg-emerald-500" : "bg-primary"
          )}
          style={{ width: `${Math.round(pct * 100)}%` }}
        />
      </div>

      {/* Episode chips */}
      {count > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(episodes ?? []).map((ep, i) => (
            <div
              key={ep.id}
              className={cn(
                "flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs",
                ep.qaStatus === "accepted"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "border-border bg-muted/50 text-muted-foreground"
              )}
            >
              {ep.qaStatus === "accepted" ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <Clock className="size-3" />
              )}
              Take {i + 1} · {Math.round(ep.durationSec)}s
            </div>
          ))}
        </div>
      )}

      {pct >= 1 && (
        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Target reached!
        </p>
      )}
    </div>
  );
}
