"use client";

import { useState } from "react";
import { ClipboardList, Pencil, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/lib/hooks";
import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskDialog } from "./TaskDialog";
import { RESET_TYPE_CONFIG } from "./taskConfig";

export function TasksTab({ campaignId }: { campaignId: string }) {
  const tasks = useLiveQuery(
    () => db.tasks.where("campaignId").equals(campaignId).toArray(),
    [campaignId],
    []
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>(undefined);

  function openAdd() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    await db.tasks.delete(id);
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-muted-foreground" />
          <div>
            <h2 className="text-sm font-semibold">Tasks</h2>
            <p className="text-xs text-muted-foreground">
              Define manipulation tasks demonstrators will perform.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={openAdd}>
          Add task
        </Button>
      </div>

      {/* Task list */}
      {!tasks || tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-14 text-center">
          <ClipboardList className="size-6 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No tasks yet.</p>
          <p className="text-xs text-muted-foreground/70">
            Add a task to define what demonstrators should do.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y rounded-lg border">
          {tasks.map((task) => {
            const rt = RESET_TYPE_CONFIG[task.resetType];
            return (
              <div
                key={task.id}
                className="flex items-start justify-between gap-4 p-3"
              >
                <div className="flex min-w-0 flex-col gap-1.5">
                  {/* Name + badges row */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-medium">{task.name}</span>
                    <Badge variant="outline" className={rt.badgeCls}>
                      {rt.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-normal">
                      {task.bimanual ? "Bimanual" : "Single-hand"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {task.horizonSeconds}s
                    </span>
                  </div>
                  {/* Object set */}
                  {task.objectSet.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.objectSet.map((obj) => (
                        <Badge
                          key={obj}
                          variant="secondary"
                          className="py-0 text-xs font-normal"
                        >
                          {obj}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(task)}
                    aria-label="Edit task"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(task.id)}
                    aria-label="Delete task"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskDialog
        campaignId={campaignId}
        task={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
