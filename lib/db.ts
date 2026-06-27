import Dexie, { type Table } from "dexie";
import type {
  Campaign,
  Task,
  Scene,
  DeviceProfile,
  Quota,
  QualityCriteria,
  Demonstrator,
  DatasetUnit,
  Episode,
} from "./types";

export interface BlobRecord {
  key: string;
  blob: Blob;
}

class EgoForgeDB extends Dexie {
  campaigns!: Table<Campaign, string>;
  tasks!: Table<Task, string>;
  scenes!: Table<Scene, string>;
  deviceProfiles!: Table<DeviceProfile, string>;
  quotas!: Table<Quota, string>;
  qualityCriteria!: Table<QualityCriteria, string>;
  demonstrators!: Table<Demonstrator, string>;
  datasetUnits!: Table<DatasetUnit, string>;
  episodes!: Table<Episode, string>;
  blobs!: Table<BlobRecord, string>;

  constructor() {
    super("egoforge");
    this.version(1).stores({
      campaigns: "id",
      tasks: "id, campaignId",
      scenes: "id, campaignId",
      deviceProfiles: "id, campaignId",
      quotas: "id, campaignId",
      qualityCriteria: "id, campaignId",
      demonstrators: "id",
      datasetUnits: "id, campaignId, taskId, sceneId, demonstratorId",
      episodes: "id, unitId, campaignId, taskId, sceneId, demonstratorId, qaStatus",
      blobs: "key",
    });
  }
}

export const db = new EgoForgeDB();
