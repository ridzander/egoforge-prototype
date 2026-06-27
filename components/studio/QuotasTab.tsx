"use client";

import { useEffect, useRef, useState } from "react";
import { Target } from "lucide-react";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function QuotasTab({ campaignId }: { campaignId: string }) {
  const tasks = useLiveQuery(
    () => db.tasks.where("campaignId").equals(campaignId).toArray(),
    [campaignId],
    []
  );
  const scenes = useLiveQuery(
    () => db.scenes.where("campaignId").equals(campaignId).toArray(),
    [campaignId],
    []
  );
  const quota = useLiveQuery(
    () => db.quotas.where("campaignId").equals(campaignId).first(),
    [campaignId]
  );

  const [taskTargets, setTaskTargets] = useState<Record<string, number>>({});
  const [sceneTargets, setSceneTargets] = useState<Record<string, number>>({});
  const [demonstratorTarget, setDemonstratorTarget] = useState(0);
  const [saving, setSaving] = useState(false);
  const initialized = useRef(false);

  // Initialize form once when quota data arrives
  useEffect(() => {
    if (quota === undefined) return; // still loading
    if (initialized.current) return;
    initialized.current = true;
    setTaskTargets(quota?.taskTargets ?? {});
    setSceneTargets(quota?.sceneTargets ?? {});
    setDemonstratorTarget(quota?.demonstratorTarget ?? 0);
  }, [quota]);

  async function handleSave() {
    setSaving(true);
    try {
      const record = {
        campaignId,
        taskTargets,
        sceneTargets,
        demonstratorTarget,
      };
      if (quota) {
        await db.quotas.put({ ...quota, ...record });
      } else {
        await db.quotas.add({ id: crypto.randomUUID(), ...record });
      }
    } finally {
      setSaving(false);
    }
  }

  const noTasksOrScenes =
    (tasks ?? []).length === 0 && (scenes ?? []).length === 0;

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-muted-foreground" />
          <div>
            <h2 className="text-sm font-semibold">Quotas</h2>
            <p className="text-xs text-muted-foreground">
              Set episode targets per task, scene, and demonstrator.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving || noTasksOrScenes}>
          {saving ? "Saving…" : "Save quotas"}
        </Button>
      </div>

      {noTasksOrScenes ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-14 text-center">
          <Target className="size-6 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No tasks or scenes yet.</p>
          <p className="text-xs text-muted-foreground/70">
            Add tasks and scenes in their respective tabs first.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Task targets */}
          {(tasks ?? []).length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Task targets (episodes)
              </h3>
              <div className="flex flex-col divide-y rounded-lg border">
                {(tasks ?? []).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-4 px-3 py-2.5"
                  >
                    <span className="text-sm">{task.name}</span>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={taskTargets[task.id] ?? 0}
                      onChange={(e) =>
                        setTaskTargets((prev) => ({
                          ...prev,
                          [task.id]: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      className="w-24 text-right"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Scene targets */}
          {(scenes ?? []).length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Scene targets (episodes)
              </h3>
              <div className="flex flex-col divide-y rounded-lg border">
                {(scenes ?? []).map((scene) => (
                  <div
                    key={scene.id}
                    className="flex items-center justify-between gap-4 px-3 py-2.5"
                  >
                    <span className="text-sm">{scene.name}</span>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={sceneTargets[scene.id] ?? 0}
                      onChange={(e) =>
                        setSceneTargets((prev) => ({
                          ...prev,
                          [scene.id]: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      className="w-24 text-right"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Demonstrator target */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Demonstrator target
            </h3>
            <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5">
              <span className="text-sm">Unique demonstrators</span>
              <Input
                type="number"
                min={0}
                step={1}
                value={demonstratorTarget}
                onChange={(e) =>
                  setDemonstratorTarget(Math.max(0, Number(e.target.value)))
                }
                className="w-24 text-right"
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
