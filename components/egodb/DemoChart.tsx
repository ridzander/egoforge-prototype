"use client";

import type { Demonstrator } from "@/lib/types";

interface DemoChartProps {
  demonstrators: Demonstrator[];
  acceptedMap: Record<string, number>; // demonstratorId → accepted count
}

export function DemoChart({ demonstrators, acceptedMap }: DemoChartProps) {
  // Only show demonstrators who have at least one episode in scope
  const rows = demonstrators
    .map((d) => ({ demo: d, count: acceptedMap[d.id] ?? 0 }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  const max = rows[0]?.count ?? 0;

  if (rows.length === 0) {
    return (
      <div className="flex min-h-16 items-center justify-center">
        <p className="text-xs text-muted-foreground">No accepted episodes yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map(({ demo, count }) => (
        <div key={demo.id} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-right text-xs text-muted-foreground">
            {demo.name}
          </span>
          <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-muted">
            <div
              className="h-full rounded-sm bg-indigo-400 transition-all dark:bg-indigo-600"
              style={{ width: max > 0 ? `${(count / max) * 100}%` : "0%" }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs tabular-nums font-medium">
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}
