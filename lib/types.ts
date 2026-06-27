export interface Campaign {
  id: string;
  name: string;
  description: string;
  fidelityFloor: 1 | 2 | 3;
  allowedTiers: number[];
  targetEmbodiments: string[];
  license: string;
  createdAt: string;
}

export interface Task {
  id: string;
  campaignId: string;
  name: string;
  instructions: string;
  exemplarUrl?: string;
  resetType: "reversible" | "reset_free" | "reset";
  horizonSeconds: number;
  bimanual: boolean;
  successCrit: string;
  objectSet: string[];
}

export interface Scene {
  id: string;
  campaignId: string;
  name: string;
  constraints: string;
  workspaceDims: string;
}

export interface DeviceProfile {
  id: string;
  campaignId: string;
  tier: 1 | 2 | 3;
  deviceName: string;
  notes: string;
}

export interface Quota {
  id: string;
  campaignId: string;
  taskTargets: Record<string, number>;
  sceneTargets: Record<string, number>;
  demonstratorTarget: number;
}

export interface QualityCriteria {
  id: string;
  campaignId: string;
  minHandVisibilityPct: number;
  minTrackingConfidence: number;
  requireFraming: boolean;
  reviewPolicy: "auto" | "sample" | "full";
}

export interface Demonstrator {
  id: string;
  name: string;
  consent: boolean;
  assignedTaskIds: string[];
}

export interface DatasetUnit {
  id: string;
  campaignId: string;
  taskId: string;
  sceneId: string;
  demonstratorId: string;
  targetEpisodes: number;
  status: "open" | "complete";
}

export interface EpisodeQualityMetrics {
  handVisibilityPct: number;
  avgConfidence: number;
  framingOk: boolean;
  /** false when MediaPipe failed to initialise — numeric fields are not meaningful */
  trackingAvailable?: boolean;
}

export interface Episode {
  id: string;
  unitId: string;
  campaignId: string;
  taskId: string;
  sceneId: string;
  demonstratorId: string;
  videoBlobKey: string;
  durationSec: number;
  qualityMetrics: EpisodeQualityMetrics;
  qaStatus: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export type EntityName =
  | "Campaign"
  | "Task"
  | "Scene"
  | "DeviceProfile"
  | "Quota"
  | "QualityCriteria"
  | "Demonstrator"
  | "DatasetUnit"
  | "Episode";
