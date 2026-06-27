"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { Scene } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SceneDialogProps {
  campaignId: string;
  scene?: Scene;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SceneDialog({
  campaignId,
  scene,
  open,
  onOpenChange,
}: SceneDialogProps) {
  const [name, setName] = useState("");
  const [constraints, setConstraints] = useState("");
  const [workspaceDims, setWorkspaceDims] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(scene?.name ?? "");
    setConstraints(scene?.constraints ?? "");
    setWorkspaceDims(scene?.workspaceDims ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const record = {
        campaignId,
        name: name.trim(),
        constraints: constraints.trim(),
        workspaceDims: workspaceDims.trim(),
      };
      if (scene) {
        await db.scenes.update(scene.id, record);
      } else {
        await db.scenes.add({ id: crypto.randomUUID(), ...record });
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>{scene ? "Edit scene" : "New scene"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5 px-6 py-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-medium tracking-wide text-muted-foreground">Name</label>
              <Input
                required
                placeholder="e.g. kitchen-counter"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-medium tracking-wide text-muted-foreground">Workspace dimensions</label>
              <Input
                placeholder="e.g. 40x60cm"
                value={workspaceDims}
                onChange={(e) => setWorkspaceDims(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-medium tracking-wide text-muted-foreground">Constraints</label>
              <Textarea
                rows={3}
                placeholder="Describe physical setup requirements."
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 rounded-b-xl border-t bg-muted/50 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving || !name.trim()}>
              {saving ? "Saving…" : scene ? "Save changes" : "Add scene"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
