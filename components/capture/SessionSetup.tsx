"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Video } from "lucide-react";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/lib/hooks";
import { useCaptureStore } from "@/lib/stores/captureStore";
import { TIER_CONFIG } from "@/components/studio/DeviceDialog";
import { RESET_TYPE_CONFIG } from "@/components/studio/taskConfig";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Campaign, Task, Scene } from "@/lib/types";

// ─── sub-components ──────────────────────────────────────────────────────────

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
        {n}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function TaskDetail({ task }: { task: Task }) {
  const rt = RESET_TYPE_CONFIG[task.resetType];
  return (
    <div className="mt-2 flex flex-col gap-2 rounded-lg border bg-muted/30 p-3">
      {task.instructions && (
        <p className="text-sm text-muted-foreground">{task.instructions}</p>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className={rt.badgeCls}>
          {rt.label}
        </Badge>
        <Badge variant="outline" className="text-xs font-normal">
          {task.bimanual ? "Bimanual" : "Single-hand"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {task.horizonSeconds}s horizon
        </span>
        {task.objectSet.map((obj) => (
          <Badge key={obj} variant="secondary" className="py-0 text-xs font-normal">
            {obj}
          </Badge>
        ))}
      </div>
      {task.successCrit && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Success: </span>
          {task.successCrit}
        </p>
      )}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function SessionSetup() {
  const router = useRouter();
  const setSession = useCaptureStore((s) => s.setSession);

  const [campaignId, setCampaignId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [sceneId, setSceneId] = useState("");
  const [tier, setTier] = useState<1 | 2 | 3 | null>(null);

  const campaigns = useLiveQuery<Campaign[]>(
    () => db.campaigns.toArray(),
    [],
    []
  );

  const tasks = useLiveQuery<Task[]>(
    async () => {
      if (!campaignId) return [];
      return db.tasks.where("campaignId").equals(campaignId).toArray();
    },
    [campaignId],
    []
  );

  const scenes = useLiveQuery<Scene[]>(
    async () => {
      if (!campaignId) return [];
      return db.scenes.where("campaignId").equals(campaignId).toArray();
    },
    [campaignId],
    []
  );

  const selectedCampaign = campaigns?.find((c) => c.id === campaignId);
  const selectedTask = tasks?.find((t) => t.id === taskId);

  const allowedTiers = (selectedCampaign?.allowedTiers ?? []).filter((t) =>
    [1, 2, 3].includes(t)
  ) as (1 | 2 | 3)[];

  function handleCampaignChange(id: string) {
    setCampaignId(id);
    setTaskId("");
    setSceneId("");
    setTier(null);
  }

  function handleTaskChange(id: string) {
    setTaskId(id);
    setSceneId("");
    setTier(null);
  }

  function handleSceneChange(id: string) {
    setSceneId(id);
    setTier(null);
  }

  const canStart = Boolean(campaignId && taskId && sceneId && tier !== null);

  function handleStart() {
    if (!canStart || tier === null) return;
    setSession({ campaignId, taskId, sceneId, tier });
    router.push("/capture/session");
  }

  const noCampaigns = (campaigns ?? []).length === 0;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
          <Video className="size-4 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Capture</h1>
          <p className="text-xs text-muted-foreground">
            Configure your session before recording.
          </p>
        </div>
      </div>

      {noCampaigns ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-14 text-center">
          <p className="text-sm text-muted-foreground">No campaigns yet.</p>
          <p className="text-xs text-muted-foreground/70">
            Create a campaign in Studio first.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-1"
            onClick={() => router.push("/studio")}
          >
            Go to Studio
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Step 1 — Campaign */}
          <div className="flex flex-col gap-2">
            <StepLabel n={1} label="Campaign" />
            <Select value={campaignId} onValueChange={handleCampaignChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a campaign…" />
              </SelectTrigger>
              <SelectContent>
                {(campaigns ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2 — Task */}
          {campaignId && (
            <div className="flex flex-col gap-2">
              <StepLabel n={2} label="Task" />
              {(tasks ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No tasks in this campaign — add some in Studio.
                </p>
              ) : (
                <>
                  <Select value={taskId} onValueChange={handleTaskChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task…" />
                    </SelectTrigger>
                    <SelectContent>
                      {(tasks ?? []).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTask && <TaskDetail task={selectedTask} />}
                </>
              )}
            </div>
          )}

          {/* Step 3 — Scene */}
          {taskId && (
            <div className="flex flex-col gap-2">
              <StepLabel n={3} label="Scene" />
              {(scenes ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No scenes in this campaign — add some in Studio.
                </p>
              ) : (
                <Select value={sceneId} onValueChange={handleSceneChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scene…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(scenes ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                        {s.workspaceDims ? ` — ${s.workspaceDims}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Step 4 — Device tier */}
          {sceneId && allowedTiers.length > 0 && (
            <div className="flex flex-col gap-2">
              <StepLabel n={4} label="Device tier (simulated)" />
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${allowedTiers.length}, 1fr)`,
                }}
              >
                {allowedTiers.map((t) => {
                  const tc = TIER_CONFIG[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-lg border p-3 text-sm transition-colors",
                        tier === t
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <span className="font-medium">{tc.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {tc.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Start */}
          <Button
            size="default"
            disabled={!canStart}
            onClick={handleStart}
            className="mt-2 w-full gap-2"
          >
            Start session
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
