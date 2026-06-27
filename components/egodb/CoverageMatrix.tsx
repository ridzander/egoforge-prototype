"use client";

import { cn } from "@/lib/utils";
import type { Scene, Task } from "@/lib/types";

// acceptedMap and targetMap are keyed by `${taskId}|${sceneId}`
interface CoverageMatrixProps {
  tasks: Task[];
  scenes: Scene[];
  acceptedMap: Record<string, number>;
  targetMap: Record<string, number>;
}

function cellBg(accepted: number, target: number): string {
  if (accepted === 0 && target === 0) return "bg-muted text-muted-foreground/50";
  if (accepted === 0) return "bg-muted text-muted-foreground";
  if (target === 0) return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
  const pct = accepted / target;
  if (pct >= 1) return "bg-emerald-500 text-white font-medium";
  if (pct >= 0.75) return "bg-indigo-400 text-white dark:bg-indigo-600";
  if (pct >= 0.5) return "bg-indigo-300 text-indigo-900 dark:bg-indigo-700 dark:text-white";
  if (pct >= 0.25) return "bg-indigo-200 text-indigo-800 dark:bg-indigo-800/80 dark:text-indigo-100";
  return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200";
}

export function CoverageMatrix({ tasks, scenes, acceptedMap, targetMap }: CoverageMatrixProps) {
  if (tasks.length === 0 || scenes.length === 0) {
    return (
      <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed">
        <p className="text-xs text-muted-foreground">
          Select a campaign to see the coverage matrix.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            {/* top-left corner */}
            <th className="w-40 pb-1 pr-2 text-right text-[10px] font-normal text-muted-foreground/60">
              task / scene →
            </th>
            {scenes.map((s) => (
              <th
                key={s.id}
                className="max-w-[120px] overflow-hidden px-1 pb-1 text-center font-medium text-muted-foreground"
              >
                <span className="block truncate">{s.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td className="max-w-[160px] pr-2 py-0.5 text-right font-medium text-foreground">
                <span className="block truncate">{t.name}</span>
              </td>
              {scenes.map((s) => {
                const key = `${t.id}|${s.id}`;
                const accepted = acceptedMap[key] ?? 0;
                const target = targetMap[key] ?? 0;
                return (
                  <td key={s.id} className="p-0.5">
                    <div
                      className={cn(
                        "flex h-10 min-w-[56px] flex-col items-center justify-center rounded",
                        cellBg(accepted, target)
                      )}
                    >
                      <span className="text-sm leading-none">{accepted}</span>
                      {target > 0 && (
                        <span className="mt-0.5 text-[9px] opacity-70">/ {target}</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
        <span>Shade:</span>
        {[
          { cls: "bg-muted", label: "0" },
          { cls: "bg-indigo-100 dark:bg-indigo-900/60", label: "1–24%" },
          { cls: "bg-indigo-200 dark:bg-indigo-800/80", label: "25–49%" },
          { cls: "bg-indigo-300 dark:bg-indigo-700", label: "50–74%" },
          { cls: "bg-indigo-400 dark:bg-indigo-600", label: "75–99%" },
          { cls: "bg-emerald-500", label: "≥ target" },
        ].map(({ cls, label }) => (
          <span key={label} className="flex items-center gap-1">
            <span className={cn("inline-block h-3 w-3 rounded-sm", cls)} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
