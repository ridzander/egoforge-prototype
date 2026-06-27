"use client";

import { useState } from "react";
import { Smartphone, Pencil, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/lib/hooks";
import type { DeviceProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeviceDialog, TIER_CONFIG } from "./DeviceDialog";

export function DevicesTab({ campaignId }: { campaignId: string }) {
  const devices = useLiveQuery(
    () => db.deviceProfiles.where("campaignId").equals(campaignId).toArray(),
    [campaignId],
    []
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DeviceProfile | undefined>(undefined);

  function openAdd() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(device: DeviceProfile) {
    setEditing(device);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="size-4 text-muted-foreground" />
          <div>
            <h2 className="text-sm font-semibold">Device profiles</h2>
            <p className="text-xs text-muted-foreground">
              Simulated device tiers that demonstrators can select.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={openAdd}>
          Add device
        </Button>
      </div>

      {!devices || devices.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-14 text-center">
          <Smartphone className="size-6 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No device profiles yet.</p>
          <p className="text-xs text-muted-foreground/70">
            Device tiers are simulated — add profiles to document them.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y rounded-lg border">
          {devices.map((device) => {
            const tc = TIER_CONFIG[device.tier];
            return (
              <div
                key={device.id}
                className="flex items-start justify-between gap-4 p-3"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className={tc.badgeCls}>
                      {tc.label}
                    </Badge>
                    <span className="text-sm font-medium">{device.deviceName}</span>
                    <span className="text-xs text-muted-foreground">
                      {tc.description}
                    </span>
                  </div>
                  {device.notes && (
                    <p className="truncate text-xs text-muted-foreground">
                      {device.notes}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(device)}
                    aria-label="Edit device profile"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => db.deviceProfiles.delete(device.id)}
                    aria-label="Delete device profile"
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

      <DeviceDialog
        campaignId={campaignId}
        device={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
