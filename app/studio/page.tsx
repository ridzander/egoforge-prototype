"use client";

import { db } from "@/lib/db";
import { useLiveQuery } from "@/lib/hooks";
import { NewCampaignDialog } from "@/components/NewCampaignDialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Campaign } from "@/lib/types";

function CampaignCard({
  campaign,
  taskCount,
  sceneCount,
}: {
  campaign: Campaign;
  taskCount: number;
  sceneCount: number;
}) {
  return (
    <Link href={`/studio/${campaign.id}`} className="group block">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">
              {campaign.name}
            </CardTitle>
            <Badge variant="secondary" className="shrink-0">
              Floor {campaign.fidelityFloor}
            </Badge>
          </div>
          {campaign.description && (
            <CardDescription className="line-clamp-2 text-xs">
              {campaign.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tasks</dt>
              <dd className="font-medium">{taskCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Scenes</dt>
              <dd className="font-medium">{sceneCount}</dd>
            </div>
            <div className="col-span-2 flex justify-between">
              <dt className="text-muted-foreground">License</dt>
              <dd className="font-medium">{campaign.license}</dd>
            </div>
            <div className="col-span-2 flex justify-between">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium">
                {new Date(campaign.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function StudioPage() {
  const campaigns = useLiveQuery(() => db.campaigns.toArray(), []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);
  const scenes = useLiveQuery(() => db.scenes.toArray(), []);

  const loading = campaigns === undefined;

  const taskCountByCampaign = (tasks ?? []).reduce<Record<string, number>>(
    (acc, t) => ({ ...acc, [t.campaignId]: (acc[t.campaignId] ?? 0) + 1 }),
    {}
  );
  const sceneCountByCampaign = (scenes ?? []).reduce<Record<string, number>>(
    (acc, s) => ({ ...acc, [s.campaignId]: (acc[s.campaignId] ?? 0) + 1 }),
    {}
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Studio</h1>
          <p className="text-sm text-muted-foreground">
            Configure campaigns, tasks, and scenes.
          </p>
        </div>
        <NewCampaignDialog />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">No campaigns yet.</p>
          <NewCampaignDialog />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              taskCount={taskCountByCampaign[c.id] ?? 0}
              sceneCount={sceneCountByCampaign[c.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
