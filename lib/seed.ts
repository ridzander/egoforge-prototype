import { db } from "./db";
import type {
  Campaign,
  Task,
  Scene,
  DeviceProfile,
  Quota,
  QualityCriteria,
  Demonstrator,
} from "./types";

export async function seed() {
  const count = await db.campaigns.count();
  if (count > 0) return;

  const campaignId = crypto.randomUUID();
  const task1Id = crypto.randomUUID();
  const task2Id = crypto.randomUUID();
  const scene1Id = crypto.randomUUID();
  const scene2Id = crypto.randomUUID();
  const demonstratorId = crypto.randomUUID();

  const campaign: Campaign = {
    id: campaignId,
    name: "Tabletop manipulation v1",
    description: "Egocentric manipulation data collection for tabletop tasks",
    fidelityFloor: 2,
    allowedTiers: [1, 2, 3],
    targetEmbodiments: ["bimanual-arm", "single-arm"],
    license: "CC-BY-4.0",
    createdAt: new Date().toISOString(),
  };

  const tasks: Task[] = [
    {
      id: task1Id,
      campaignId,
      name: "cup-on-saucer",
      instructions: "Place the cup onto the saucer using both hands.",
      resetType: "reset",
      horizonSeconds: 8,
      bimanual: true,
      successCrit: "Cup resting stably on saucer for 2 seconds.",
      objectSet: ["cup", "saucer"],
    },
    {
      id: task2Id,
      campaignId,
      name: "screw-unscrew-cap",
      instructions: "Unscrew the bottle cap and place it beside the bottle.",
      resetType: "reversible",
      horizonSeconds: 6,
      bimanual: false,
      successCrit: "Cap fully removed and set on the surface.",
      objectSet: ["bottle", "cap"],
    },
  ];

  const scenes: Scene[] = [
    {
      id: scene1Id,
      campaignId,
      name: "kitchen-counter",
      constraints: "Clear 40x60cm workspace, neutral background",
      workspaceDims: "40x60cm",
    },
    {
      id: scene2Id,
      campaignId,
      name: "office-desk",
      constraints: "Clear 40x60cm workspace, desk mat present",
      workspaceDims: "40x60cm",
    },
  ];

  const deviceProfiles: DeviceProfile[] = [
    {
      id: crypto.randomUUID(),
      campaignId,
      tier: 1,
      deviceName: "Smartphone (720p)",
      notes: "Minimum viable capture device",
    },
    {
      id: crypto.randomUUID(),
      campaignId,
      tier: 2,
      deviceName: "Webcam 1080p",
      notes: "Standard capture device",
    },
    {
      id: crypto.randomUUID(),
      campaignId,
      tier: 3,
      deviceName: "GoPro / DSLR 4K",
      notes: "High-fidelity capture device",
    },
  ];

  const quota: Quota = {
    id: crypto.randomUUID(),
    campaignId,
    taskTargets: { [task1Id]: 20, [task2Id]: 20 },
    sceneTargets: { [scene1Id]: 20, [scene2Id]: 20 },
    demonstratorTarget: 5,
  };

  const qualityCriteria: QualityCriteria = {
    id: crypto.randomUUID(),
    campaignId,
    minHandVisibilityPct: 70,
    minTrackingConfidence: 0.6,
    requireFraming: true,
    reviewPolicy: "sample",
  };

  const demonstrator: Demonstrator = {
    id: demonstratorId,
    name: "Demo User",
    consent: true,
    assignedTaskIds: [task1Id, task2Id],
  };

  await db.transaction(
    "rw",
    [
      db.campaigns,
      db.tasks,
      db.scenes,
      db.deviceProfiles,
      db.quotas,
      db.qualityCriteria,
      db.demonstrators,
    ],
    async () => {
      await db.campaigns.add(campaign);
      await db.tasks.bulkAdd(tasks);
      await db.scenes.bulkAdd(scenes);
      await db.deviceProfiles.bulkAdd(deviceProfiles);
      await db.quotas.add(quota);
      await db.qualityCriteria.add(qualityCriteria);
      await db.demonstrators.add(demonstrator);
    }
  );
}
