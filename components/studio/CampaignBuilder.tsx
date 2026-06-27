"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/lib/hooks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TasksTab } from "./TasksTab";
import { ScenesTab } from "./ScenesTab";
import { DevicesTab } from "./DevicesTab";
import { QuotasTab } from "./QuotasTab";
import { QualityTab } from "./QualityTab";

export function CampaignBuilder({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const campaign = useLiveQuery(
    () => db.campaigns.get(campaignId),
    [campaignId]
  );

  if (!campaign) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  async function updateFidelityFloor(val: string) {
    await db.campaigns.update(campaignId, {
      fidelityFloor: Number(val) as 1 | 2 | 3,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => router.push("/studio")}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold leading-tight">
              {campaign.name}
            </h1>
            <p className="text-xs text-muted-foreground">Campaign builder</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-sm text-muted-foreground">Fidelity floor</span>
          <Select
            value={String(campaign.fidelityFloor)}
            onValueChange={updateFidelityFloor}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Tier 1</SelectItem>
              <SelectItem value="2">Tier 2</SelectItem>
              <SelectItem value="3">Tier 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="scenes">Scenes</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="quotas">Quotas</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          <TasksTab campaignId={campaignId} />
        </TabsContent>
        <TabsContent value="scenes">
          <ScenesTab campaignId={campaignId} />
        </TabsContent>
        <TabsContent value="devices">
          <DevicesTab campaignId={campaignId} />
        </TabsContent>
        <TabsContent value="quotas">
          <QuotasTab campaignId={campaignId} />
        </TabsContent>
        <TabsContent value="quality">
          <QualityTab campaignId={campaignId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
