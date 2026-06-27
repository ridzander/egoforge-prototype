"use client";

import { useState } from "react";
import { Download, Zap } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/lib/hooks";
import { applyGate, getSuggestion } from "@/lib/acceptanceGate";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GateStats } from "./GateStats";
import { CoverageMatrix } from "./CoverageMatrix";
import { DemoChart } from "./DemoChart";
import { EpisodeTable } from "./EpisodeTable";
import { EpisodeDialog } from "./EpisodeDialog";
import type {
  Campaign,
  DatasetUnit,
  Demonstrator,
  Episode,
  QualityCriteria,
  Scene,
  Task,
} from "@/lib/types";
import type { Suggestion } from "@/lib/acceptanceGate";

export function EgoDBDashboard() {
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [gateRunning, setGateRunning] = useState(false);

  // ── reference data ────────────────────────────────────────────────────────
  const campaigns = useLiveQuery<Campaign[]>(() => db.campaigns.toArray(), [], []);

  const tasks = useLiveQuery<Task[]>(
    async () =>
      campaignFilter === "all"
        ? db.tasks.toArray()
        : db.tasks.where("campaignId").equals(campaignFilter).toArray(),
    [campaignFilter],
    []
  );

  // Campaign-scoped scenes so the coverage matrix rows/cols align correctly
  const scenes = useLiveQuery<Scene[]>(
    async () =>
      campaignFilter === "all"
        ? db.scenes.toArray()
        : db.scenes.where("campaignId").equals(campaignFilter).toArray(),
    [campaignFilter],
    []
  );

  const demonstrators = useLiveQuery<Demonstrator[]>(
    () => db.demonstrators.toArray(),
    [],
    []
  );
  const allCriteria = useLiveQuery<QualityCriteria[]>(
    () => db.qualityCriteria.toArray(),
    [],
    []
  );
  const allUnits = useLiveQuery<DatasetUnit[]>(
    async () =>
      campaignFilter === "all"
        ? db.datasetUnits.toArray()
        : db.datasetUnits.where("campaignId").equals(campaignFilter).toArray(),
    [campaignFilter],
    []
  );

  // ── episodes (filtered + newest-first) ───────────────────────────────────
  const episodes = useLiveQuery<Episode[]>(
    async () => {
      let rows: Episode[];
      if (taskFilter !== "all") {
        rows = await db.episodes.where("taskId").equals(taskFilter).toArray();
      } else if (campaignFilter !== "all") {
        rows = await db.episodes.where("campaignId").equals(campaignFilter).toArray();
      } else {
        rows = await db.episodes.toArray();
      }
      return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    [campaignFilter, taskFilter],
    []
  );

  // ── lookup maps ───────────────────────────────────────────────────────────
  const taskMap = Object.fromEntries((tasks ?? []).map((t) => [t.id, t]));
  const sceneMap = Object.fromEntries((scenes ?? []).map((s) => [s.id, s]));
  const demoMap = Object.fromEntries((demonstrators ?? []).map((d) => [d.id, d]));
  const criteriaMap = Object.fromEntries(
    (allCriteria ?? []).map((c) => [c.campaignId, c])
  );

  const eps = episodes ?? [];

  // ── gate suggestions ──────────────────────────────────────────────────────
  const suggestionMap: Record<string, Suggestion> = {};
  for (const ep of eps) {
    if (ep.qaStatus !== "pending") continue;
    const crit = criteriaMap[ep.campaignId];
    if (crit) suggestionMap[ep.id] = getSuggestion(ep, crit);
  }

  // ── status counts ─────────────────────────────────────────────────────────
  const accepted = eps.filter((e) => e.qaStatus === "accepted").length;
  const rejected = eps.filter((e) => e.qaStatus === "rejected").length;
  const pending  = eps.filter((e) => e.qaStatus === "pending").length;

  // ── coverage data: (taskId|sceneId) → { accepted, target } ───────────────
  //
  // Target per cell = sum of targetEpisodes across all DatasetUnits for (task, scene).
  // Uses the campaign-scoped units query so it aligns with the filter.
  const coverageAcceptedMap: Record<string, number> = {};
  const coverageTargetMap: Record<string, number> = {};

  for (const ep of eps) {
    if (ep.qaStatus !== "accepted") continue;
    const key = `${ep.taskId}|${ep.sceneId}`;
    coverageAcceptedMap[key] = (coverageAcceptedMap[key] ?? 0) + 1;
  }
  for (const unit of allUnits ?? []) {
    const key = `${unit.taskId}|${unit.sceneId}`;
    coverageTargetMap[key] = (coverageTargetMap[key] ?? 0) + unit.targetEpisodes;
  }

  // ── demonstrator chart data ───────────────────────────────────────────────
  const demoAcceptedMap: Record<string, number> = {};
  for (const ep of eps) {
    if (ep.qaStatus !== "accepted") continue;
    demoAcceptedMap[ep.demonstratorId] = (demoAcceptedMap[ep.demonstratorId] ?? 0) + 1;
  }

  // ── actions ───────────────────────────────────────────────────────────────
  async function runAutoGate() {
    setGateRunning(true);
    try {
      const pendingEps = eps.filter((e) => e.qaStatus === "pending");
      if (pendingEps.length === 0) return;
      const decisions = applyGate(pendingEps, criteriaMap);
      if (decisions.length === 0) {
        toast("No changes", { description: "All pending episodes stay pending under current policy." });
        return;
      }
      await db.transaction("rw", db.episodes, async () => {
        for (const d of decisions) {
          await db.episodes.update(d.episodeId, { qaStatus: d.nextStatus });
        }
      });
      const nAccepted = decisions.filter((d) => d.nextStatus === "accepted").length;
      const nRejected = decisions.filter((d) => d.nextStatus === "rejected").length;
      toast.success("Auto-gate complete", {
        description: `${nAccepted} accepted · ${nRejected} rejected · ${pendingEps.length - decisions.length} left for review.`,
      });
    } catch (err) {
      console.error(err);
      toast.error("Auto-gate failed");
    } finally {
      setGateRunning(false);
    }
  }

  async function handleExport() {
    // Always export all accepted episodes globally, resolved with full names
    const [acceptedAll, allTasks, allScenes, allDemos, allCampaigns] = await Promise.all([
      db.episodes.where("qaStatus").equals("accepted").toArray(),
      db.tasks.toArray(),
      db.scenes.toArray(),
      db.demonstrators.toArray(),
      db.campaigns.toArray(),
    ]);

    const tLookup = Object.fromEntries(allTasks.map((t) => [t.id, t.name]));
    const sLookup = Object.fromEntries(allScenes.map((s) => [s.id, s.name]));
    const dLookup = Object.fromEntries(allDemos.map((d) => [d.id, d.name]));
    const cLookup = Object.fromEntries(allCampaigns.map((c) => [c.id, c.name]));

    const manifest = acceptedAll.map((ep) => ({
      id: ep.id,
      campaign: cLookup[ep.campaignId] ?? ep.campaignId,
      task: tLookup[ep.taskId] ?? ep.taskId,
      scene: sLookup[ep.sceneId] ?? ep.sceneId,
      demonstrator: dLookup[ep.demonstratorId] ?? ep.demonstratorId,
      durationSec: ep.durationSec,
      qualityMetrics: ep.qualityMetrics,
      createdAt: ep.createdAt,
    }));

    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "egoforge-export.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded", {
      description: `${manifest.length} accepted episode${manifest.length !== 1 ? "s" : ""} exported to egoforge-export.json.`,
    });
  }

  function handleCampaignChange(val: string) {
    setCampaignFilter(val);
    setTaskFilter("all");
  }

  const dialogEpisode = selectedEpisode;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">EgoDB</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Browse, review, and export recorded episodes
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleExport}
          >
            <Download className="size-3.5" />
            Export JSON
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            disabled={gateRunning || pending === 0}
            onClick={runAutoGate}
          >
            <Zap className="size-3.5" />
            {gateRunning ? "Running…" : "Run auto-gate"}
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <GateStats accepted={accepted} pending={pending} rejected={rejected} />

      {/* Analytics: Coverage matrix + Demonstrator chart */}
      {eps.length > 0 && (
        <div className="flex flex-col gap-5">
          {/* Coverage matrix */}
          <section className="flex flex-col gap-3 rounded-lg border p-4">
            <div>
              <h2 className="text-sm font-medium">Coverage matrix</h2>
              <p className="text-xs text-muted-foreground">
                Accepted episodes per task × scene — shaded by proximity to quota target
              </p>
            </div>
            <CoverageMatrix
              tasks={tasks ?? []}
              scenes={scenes ?? []}
              acceptedMap={coverageAcceptedMap}
              targetMap={coverageTargetMap}
            />
          </section>

          {/* Demonstrator chart */}
          <section className="flex flex-col gap-3 rounded-lg border p-4">
            <div>
              <h2 className="text-sm font-medium">Accepted episodes per demonstrator</h2>
              <p className="text-xs text-muted-foreground">
                Diversity of collection across demonstrators
              </p>
            </div>
            <DemoChart
              demonstrators={demonstrators ?? []}
              acceptedMap={demoAcceptedMap}
            />
          </section>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={campaignFilter} onValueChange={handleCampaignChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All campaigns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All campaigns</SelectItem>
            {(campaigns ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={taskFilter} onValueChange={setTaskFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All tasks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tasks</SelectItem>
            {(tasks ?? []).map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {eps.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {eps.length} episode{eps.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Episode table */}
      <EpisodeTable
        episodes={eps}
        taskMap={taskMap}
        sceneMap={sceneMap}
        demoMap={demoMap}
        suggestionMap={suggestionMap}
        onRowClick={setSelectedEpisode}
      />

      {/* Row detail dialog */}
      {dialogEpisode && (
        <EpisodeDialog
          episode={dialogEpisode}
          task={taskMap[dialogEpisode.taskId]}
          scene={sceneMap[dialogEpisode.sceneId]}
          demonstrator={demoMap[dialogEpisode.demonstratorId]}
          criteria={criteriaMap[dialogEpisode.campaignId]}
          suggestion={suggestionMap[dialogEpisode.id]}
          open={!!dialogEpisode}
          onOpenChange={(open) => {
            if (!open) setSelectedEpisode(null);
          }}
        />
      )}
    </div>
  );
}
