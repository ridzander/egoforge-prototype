"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  count: number;
  total: number;
  colorCls: string;
  bgCls: string;
}

function StatCard({ label, count, total, colorCls, bgCls }: StatCardProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={cn("flex flex-col gap-1 rounded-lg border p-4", bgCls)}>
      <span className={cn("text-2xl font-bold tabular-nums", colorCls)}>{count}</span>
      <div className="flex items-baseline justify-between gap-1">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{pct}%</span>
      </div>
    </div>
  );
}

interface GateStatsProps {
  accepted: number;
  pending: number;
  rejected: number;
}

export function GateStats({ accepted, pending, rejected }: GateStatsProps) {
  const total = accepted + pending + rejected;
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        label="Accepted"
        count={accepted}
        total={total}
        colorCls="text-emerald-600 dark:text-emerald-400"
        bgCls="border-emerald-100 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
      />
      <StatCard
        label="Pending"
        count={pending}
        total={total}
        colorCls="text-amber-600 dark:text-amber-400"
        bgCls="border-amber-100 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"
      />
      <StatCard
        label="Rejected"
        count={rejected}
        total={total}
        colorCls="text-red-600 dark:text-red-400"
        bgCls="border-red-100 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
      />
    </div>
  );
}
