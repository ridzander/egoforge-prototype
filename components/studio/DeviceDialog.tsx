"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { DeviceProfile } from "@/lib/types";
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

export const TIER_CONFIG: Record<
  1 | 2 | 3,
  { label: string; description: string; badgeCls: string }
> = {
  1: {
    label: "Tier 1",
    description: "Research headset",
    badgeCls: "border-primary/40 bg-primary/10 text-primary font-mono",
  },
  2: {
    label: "Tier 2",
    description: "Lightweight glasses",
    badgeCls: "border-border bg-secondary text-foreground font-mono",
  },
  3: {
    label: "Tier 3",
    description: "Phone",
    badgeCls: "border-muted-foreground/30 bg-muted text-muted-foreground font-mono",
  },
};

interface DeviceDialogProps {
  campaignId: string;
  device?: DeviceProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeviceDialog({
  campaignId,
  device,
  open,
  onOpenChange,
}: DeviceDialogProps) {
  const [tier, setTier] = useState<"1" | "2" | "3">("2");
  const [deviceName, setDeviceName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTier(String(device?.tier ?? 2) as "1" | "2" | "3");
    setDeviceName(device?.deviceName ?? "");
    setNotes(device?.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const record = {
        campaignId,
        tier: Number(tier) as 1 | 2 | 3,
        deviceName: deviceName.trim(),
        notes: notes.trim(),
      };
      if (device) {
        await db.deviceProfiles.update(device.id, record);
      } else {
        await db.deviceProfiles.add({ id: crypto.randomUUID(), ...record });
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
          <DialogTitle>
            {device ? "Edit device profile" : "New device profile"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5 px-6 py-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-medium tracking-wide text-muted-foreground">Tier</label>
              <Select
                value={tier}
                onValueChange={(v) => setTier(v as "1" | "2" | "3")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Tier 1 — Research headset</SelectItem>
                  <SelectItem value="2">Tier 2 — Lightweight glasses</SelectItem>
                  <SelectItem value="3">Tier 3 — Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-medium tracking-wide text-muted-foreground">Device name</label>
              <Input
                required
                placeholder="e.g. Meta Quest Pro"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-medium tracking-wide text-muted-foreground">Notes</label>
              <Textarea
                rows={3}
                placeholder="Camera specs, known limitations, setup notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
            <Button
              type="submit"
              size="sm"
              disabled={saving || !deviceName.trim()}
            >
              {saving ? "Saving…" : device ? "Save changes" : "Add device"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
