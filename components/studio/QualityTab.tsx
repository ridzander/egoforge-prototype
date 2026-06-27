"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/lib/hooks";
import type { QualityCriteria } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function QualityTab({ campaignId }: { campaignId: string }) {
  const criteria = useLiveQuery(
    () => db.qualityCriteria.where("campaignId").equals(campaignId).first(),
    [campaignId]
  );

  const [minHandVisibilityPct, setMinHandVisibilityPct] = useState(70);
  const [minTrackingConfidence, setMinTrackingConfidence] = useState(0.6);
  const [requireFraming, setRequireFraming] = useState(true);
  const [reviewPolicy, setReviewPolicy] =
    useState<QualityCriteria["reviewPolicy"]>("sample");
  const [saving, setSaving] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (criteria === undefined) return;
    if (initialized.current) return;
    initialized.current = true;
    setMinHandVisibilityPct(criteria?.minHandVisibilityPct ?? 70);
    setMinTrackingConfidence(criteria?.minTrackingConfidence ?? 0.6);
    setRequireFraming(criteria?.requireFraming ?? true);
    setReviewPolicy(criteria?.reviewPolicy ?? "sample");
  }, [criteria]);

  async function handleSave() {
    setSaving(true);
    try {
      const record = {
        campaignId,
        minHandVisibilityPct,
        minTrackingConfidence,
        requireFraming,
        reviewPolicy,
      };
      if (criteria) {
        await db.qualityCriteria.put({ ...criteria, ...record });
      } else {
        await db.qualityCriteria.add({ id: crypto.randomUUID(), ...record });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-muted-foreground" />
          <div>
            <h2 className="text-sm font-semibold">Quality criteria</h2>
            <p className="text-xs text-muted-foreground">
              Hand visibility, tracking confidence, framing, and review policy.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save criteria"}
        </Button>
      </div>

      <div className="flex flex-col gap-6 rounded-lg border p-5">
        {/* Hand visibility */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Min hand visibility
            </label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {Math.round(minHandVisibilityPct)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={minHandVisibilityPct}
            onChange={(e) => setMinHandVisibilityPct(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="text-xs text-muted-foreground">
            Episodes where hands are visible for less than this fraction of
            frames will be flagged.
          </p>
        </div>

        <div className="border-t" />

        {/* Tracking confidence */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Min tracking confidence
            </label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {minTrackingConfidence.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={minTrackingConfidence}
            onChange={(e) =>
              setMinTrackingConfidence(Number(e.target.value))
            }
            className="w-full accent-primary"
          />
          <p className="text-xs text-muted-foreground">
            Average MediaPipe landmark confidence required across an episode
            (0 – 1).
          </p>
        </div>

        <div className="border-t" />

        {/* Require framing */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Require framing</p>
            <p className="text-xs text-muted-foreground">
              Reject episodes where hands leave the camera frame.
            </p>
          </div>
          <div className="flex h-9 overflow-hidden rounded-lg border border-input text-sm">
            <button
              type="button"
              onClick={() => setRequireFraming(false)}
              className={cn(
                "w-14 transition-colors",
                !requireFraming
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              No
            </button>
            <button
              type="button"
              onClick={() => setRequireFraming(true)}
              className={cn(
                "w-14 border-l border-input transition-colors",
                requireFraming
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              Yes
            </button>
          </div>
        </div>

        <div className="border-t" />

        {/* Review policy */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Review policy</p>
            <p className="text-xs text-muted-foreground">
              auto — accept if metrics pass; sample — review a subset; full —
              manual review every episode.
            </p>
          </div>
          <Select
            value={reviewPolicy}
            onValueChange={(v) =>
              setReviewPolicy(v as QualityCriteria["reviewPolicy"])
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="sample">Sample</SelectItem>
              <SelectItem value="full">Full</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
