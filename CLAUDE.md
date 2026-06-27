@AGENTS.md

# EgoForge — Context for Claude Code

## Product
EgoForge is a prototype of a task-configuration + data-collection platform for
egocentric human manipulation data (used to train robot manipulation policies).
Three layers:
1. Studio  — config tool (form builder): campaigns, tasks, scenes, device tiers,
   diversity quotas, quality criteria.
2. Capture — demonstrator app (the form): webcam recording, real-time hand
   tracking, live quality checkpoints, dataset-unit progress, reset prompts,
   episode saving.
3. EgoDB   — data dashboard: quality acceptance gate, coverage matrix, export.

## Stack
- Next.js 15 App Router + TypeScript
- Tailwind + shadcn/ui (components already installed under @/components/ui)
- Zustand for cross-component state
- Dexie.js (IndexedDB) for ALL persistence incl. recorded video blobs (lib/db.ts)
- MediaPipe Tasks Vision (HandLandmarker) for real browser hand-pose annotation
- MediaRecorder + getUserMedia for capture
- Deploy target: Vercel

## Conventions
- Server comby default; add "use client" only where browser APIs are
  needed (camera, IndexedDB, MediaPipe, Zustand stores with effects).
- All shared types live in lib/types.ts. Dexie schema lives in lib/db.ts.
- No auth in v1 — single local demonstrator/admin.
- Keep components small and focused. Prefer composition over big files.
- Round any number shown to the user.
- Commit after each working feature with a clear message.

## What is real vs simulated
- REAL: webcam capture, MediaPipe 21-keypoint hand tracking, quality metrics
  from landmarks, CRUD, persistence, coverage analytics.
- SIMULATED: device tiers (dropdown only), SLAM/camera pose, multi-site sync.

## Data model (authoritative — keep lib/types.ts in sync with this)
- Campaign: id, name, description, fidelityFloor (1|2|3), allowedTiers (number[]),
  targetEmbodiments (string[]), license, createdAt
- Task: id, campaignId, name, instructions, exemplarUrl?, resetType
  ('reversible'|'reset_free'|'reset'), horizonSeconds, bimanual (bool),
  successCrit, objectSet (string[])
- Scene: id, campaignId, name, constraints, workspaceDims (e.g. "40x60cm")
- DeviceProfile: id, campaignId, tier (1|2|3), deviceName, notes
- Quota: id, campaignId, taskTargets (Record<taskId, number of units>),
  sceneTargets (Record<sceneId, number>), demonstratorTarget (number)
- QualityCriteria: id, campaignId, minHandVisibilityPct, minTrackingConfidence,
  requireFraming (bool), reviewPolicy ('auto'|'sample'|'full')
- Demonstrator: id, name, consent (bool), assignedTaskIds (string[])
- DatasetUnit: id, campaignId, taskId, sceneId, demonstratorId, targetEpisodes,
  status ('open'|'complete')
- Episode: id, unitId, campaignId, taskId, sceneId, demonstratorId, videoBlobKey,
  durationSec, qualityMetrics { handVisibilityPct, avgConfidence, framingOk },
  qaStatus ('pending'|'accepted'|'rejected'), createdAt
