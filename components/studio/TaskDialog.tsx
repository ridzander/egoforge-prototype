"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { Task } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "./TagInput";
import { RESET_TYPE_CONFIG } from "./taskConfig";
import { cn } from "@/lib/utils";

interface TaskDialogProps {
  campaignId: string;
  task?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDialog({
  campaignId,
  task,
  open,
  onOpenChange,
}: TaskDialogProps) {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [resetType, setResetType] = useState<Task["resetType"]>("reversible");
  const [horizonSeconds, setHorizonSeconds] = useState(10);
  const [bimanual, setBimanual] = useState(false);
  const [objectSet, setObjectSet] = useState<string[]>([]);
  const [successCrit, setSuccessCrit] = useState("");
  const [exemplarUrl, setExemplarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync form when dialog opens or target task changes
  useEffect(() => {
    if (!open) return;
    setName(task?.name ?? "");
    setInstructions(task?.instructions ?? "");
    setResetType(task?.resetType ?? "reversible");
    setHorizonSeconds(task?.horizonSeconds ?? 10);
    setBimanual(task?.bimanual ?? false);
    setObjectSet(task?.objectSet ?? []);
    setSuccessCrit(task?.successCrit ?? "");
    setExemplarUrl(task?.exemplarUrl ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const record = {
        campaignId,
        name: name.trim(),
        instructions: instructions.trim(),
        resetType,
        horizonSeconds,
        bimanual,
        objectSet,
        successCrit: successCrit.trim(),
        ...(exemplarUrl.trim() ? { exemplarUrl: exemplarUrl.trim() } : {}),
      };
      if (task) {
        await db.tasks.update(task.id, record);
      } else {
        await db.tasks.add({ id: crypto.randomUUID(), ...record });
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  const resetHelp = RESET_TYPE_CONFIG[resetType].help;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex max-h-[calc(85vh-9rem)] flex-col gap-5 overflow-y-auto px-6 py-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input
                required
                placeholder="e.g. cup-on-saucer"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Instructions */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Instructions</label>
              <Textarea
                rows={3}
                placeholder="Step-by-step instructions shown to the demonstrator."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            {/* Reset type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Reset type</label>
              <Select
                value={resetType}
                onValueChange={(v) => setResetType(v as Task["resetType"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reversible">Reversible</SelectItem>
                  <SelectItem value="reset_free">Reset-free</SelectItem>
                  <SelectItem value="reset">Reset</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{resetHelp}</p>
            </div>

            {/* Horizon + Bimanual */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Horizon (seconds)</label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={horizonSeconds}
                  onChange={(e) =>
                    setHorizonSeconds(Math.max(1, Number(e.target.value)))
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Bimanual</label>
                <div className="flex h-9 overflow-hidden rounded-lg border border-input text-sm">
                  <button
                    type="button"
                    onClick={() => setBimanual(false)}
                    className={cn(
                      "flex-1 transition-colors",
                      !bimanual
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setBimanual(true)}
                    className={cn(
                      "flex-1 border-l border-input transition-colors",
                      bimanual
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>

            {/* Object set */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Object set</label>
              <TagInput
                value={objectSet}
                onChange={setObjectSet}
                placeholder="cup, saucer… press Enter to add"
              />
            </div>

            {/* Success criteria */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Success criteria</label>
              <Textarea
                rows={2}
                placeholder="How do we know the task succeeded?"
                value={successCrit}
                onChange={(e) => setSuccessCrit(e.target.value)}
              />
            </div>

            {/* Exemplar URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Exemplar URL{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <Input
                type="url"
                placeholder="https://…"
                value={exemplarUrl}
                onChange={(e) => setExemplarUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 rounded-b-xl border-t bg-muted/50 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving || !name.trim()}
            >
              {saving ? "Saving…" : task ? "Save changes" : "Add task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
