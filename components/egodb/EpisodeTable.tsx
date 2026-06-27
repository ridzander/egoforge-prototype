"use client";

import { Check, Minus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Demonstrator, Episode, Scene, Task } from "@/lib/types";
import type { Suggestion } from "@/lib/acceptanceGate";

const QA_BADGE: Record<Episode["qaStatus"], string> = {
  pending:
    "border-border bg-muted text-muted-foreground",
  accepted:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  rejected:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300",
};

const SUGGEST_BADGE: Record<"accepted" | "rejected", string> = {
  accepted:
    "border-emerald-200/60 text-emerald-600/70 dark:border-emerald-800/50 dark:text-emerald-400/70",
  rejected:
    "border-red-200/60 text-red-500/70 dark:border-red-800/50 dark:text-red-400/70",
};

interface EpisodeTableProps {
  episodes: Episode[];
  taskMap: Record<string, Task>;
  sceneMap: Record<string, Scene>;
  demoMap: Record<string, Demonstrator>;
  suggestionMap: Record<string, Suggestion>;
  onRowClick: (ep: Episode) => void;
}

export function EpisodeTable({
  episodes,
  taskMap,
  sceneMap,
  demoMap,
  suggestionMap,
  onRowClick,
}: EpisodeTableProps) {
  if (episodes.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">No episodes recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Scene</TableHead>
            <TableHead>Demonstrator</TableHead>
            <TableHead className="text-right">Duration</TableHead>
            <TableHead className="text-right">Visibility</TableHead>
            <TableHead className="text-right">Confidence</TableHead>
            <TableHead className="text-center">Framing</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {episodes.map((ep) => {
            const sug = suggestionMap[ep.id];
            return (
              <TableRow
                key={ep.id}
                className="cursor-pointer"
                onClick={() => onRowClick(ep)}
              >
                <TableCell className="font-medium">
                  {taskMap[ep.taskId]?.name ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {sceneMap[ep.sceneId]?.name ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {demoMap[ep.demonstratorId]?.name ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {Math.round(ep.durationSec)}s
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {Math.round(ep.qualityMetrics.handVisibilityPct)}%
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {(ep.qualityMetrics.avgConfidence * 100).toFixed(0)}%
                </TableCell>
                <TableCell className="text-center">
                  {ep.qualityMetrics.framingOk ? (
                    <Check className="mx-auto size-4 text-emerald-500" />
                  ) : (
                    <X className="mx-auto size-4 text-red-400" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn("capitalize text-[11px]", QA_BADGE[ep.qaStatus])}
                    >
                      {ep.qaStatus}
                    </Badge>
                    {/* Show suggested verdict for pending episodes */}
                    {ep.qaStatus === "pending" && sug && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-0.5 text-[10px]",
                          SUGGEST_BADGE[sug.verdict],
                          sug.borderline && "border-dashed"
                        )}
                      >
                        {sug.verdict === "accepted" ? (
                          <Check className="size-2.5" />
                        ) : (
                          <Minus className="size-2.5" />
                        )}
                        {sug.borderline ? "borderline" : sug.verdict}
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
