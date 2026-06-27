"use client";

import { useState } from "react";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/lib/hooks";
import type { Scene } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SceneDialog } from "./SceneDialog";

export function ScenesTab({ campaignId }: { campaignId: string }) {
  const scenes = useLiveQuery(
    () => db.scenes.where("campaignId").equals(campaignId).toArray(),
    [campaignId],
    []
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Scene | undefined>(undefined);

  function openAdd() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(scene: Scene) {
    setEditing(scene);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" />
          <div>
            <h2 className="text-sm font-semibold">Scenes</h2>
            <p className="text-xs text-muted-foreground">
              Specify workspace environments and physical constraints.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={openAdd}>
          Add scene
        </Button>
      </div>

      {!scenes || scenes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-14 text-center">
          <MapPin className="size-6 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No scenes yet.</p>
          <p className="text-xs text-muted-foreground/70">
            Add a scene to describe where tasks will be recorded.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y rounded-lg border">
          {scenes.map((scene) => (
            <div
              key={scene.id}
              className="flex items-start justify-between gap-4 p-3"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-medium">{scene.name}</span>
                  {scene.workspaceDims && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {scene.workspaceDims}
                    </Badge>
                  )}
                </div>
                {scene.constraints && (
                  <p className="truncate text-xs text-muted-foreground">
                    {scene.constraints}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openEdit(scene)}
                  aria-label="Edit scene"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => db.scenes.delete(scene.id)}
                  aria-label="Delete scene"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SceneDialog
        campaignId={campaignId}
        scene={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
