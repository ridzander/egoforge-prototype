"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCaptureStore } from "@/lib/stores/captureStore";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/lib/hooks";
import { useWebcam } from "@/components/capture/useWebcam";
import { useMediaRecorder } from "@/components/capture/useMediaRecorder";
import { useHandTracker } from "@/components/capture/useHandTracker";
import { useQualityMetrics } from "@/components/capture/useQualityMetrics";
import { CameraPreview } from "@/components/capture/CameraPreview";
import { RecordButton } from "@/components/capture/RecordButton";
import { EpisodeList } from "@/components/capture/EpisodeList";
import { TaskPanel } from "@/components/capture/TaskPanel";
import { ResetPrompt } from "@/components/capture/ResetPrompt";
import { TIER_CONFIG } from "@/components/studio/DeviceDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DatasetUnit, Quota, QualityCriteria, Task } from "@/lib/types";

// ─── helpers ─────────────────────────────────────────────────────────────────

async function getOrCreateDemonstrator(): Promise<string> {
  const existing = await db.demonstrators.toCollection().first();
  if (existing) return existing.id;
  const id = crypto.randomUUID();
  await db.demonstrators.add({
    id,
    name: "Demo User",
    consent: true,
    assignedTaskIds: [],
  });
  return id;
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function SessionPage() {
  const router = useRouter();
  const session = useCaptureStore((s) => s.session);
  const clearSession = useCaptureStore((s) => s.clearSession);

  // Guard: no session → back to setup
  useEffect(() => {
    if (!session) router.replace("/capture");
  }, [session, router]);

  // ── live data ──────────────────────────────────────────────────────────────
  const task = useLiveQuery<Task | undefined>(
    async () => (session ? db.tasks.get(session.taskId) : undefined),
    [session?.taskId]
  );

  const quota = useLiveQuery<Quota | null>(
    async () => {
      if (!session) return null;
      return (
        (await db.quotas
          .where("campaignId")
          .equals(session.campaignId)
          .first()) ?? null
      );
    },
    [session?.campaignId]
  );

  const qualityCriteria = useLiveQuery<QualityCriteria | null>(
    async () => {
      if (!session) return null;
      return (
        (await db.qualityCriteria
          .where("campaignId")
          .equals(session.campaignId)
          .first()) ?? null
      );
    },
    [session?.campaignId]
  );

  // ── unit + demonstrator init ───────────────────────────────────────────────
  const [unitId, setUnitId] = useState<string | null>(null);
  const [demonstratorId, setDemonstratorId] = useState<string | null>(null);
  const [targetEpisodes, setTargetEpisodes] = useState(8);
  const [awaitingReset, setAwaitingReset] = useState(false);
  const initStarted = useRef(false);

  useEffect(() => {
    // Wait until both session and quota are resolved (quota=undefined → loading)
    if (!session || quota === undefined) return;
    if (initStarted.current) return;
    initStarted.current = true;

    (async () => {
      const demoId = await getOrCreateDemonstrator();
      setDemonstratorId(demoId);

      // Resolve target episodes from quota, fallback 8
      const target =
        quota?.taskTargets?.[session.taskId] ?? 8;
      setTargetEpisodes(target);

      // Find or create DatasetUnit for this (campaign, task, scene, demonstrator)
      const existing = await db.datasetUnits
        .where("campaignId")
        .equals(session.campaignId)
        .filter(
          (u: DatasetUnit) =>
            u.taskId === session.taskId &&
            u.sceneId === session.sceneId &&
            u.demonstratorId === demoId
        )
        .first();

      if (existing) {
        setUnitId(existing.id);
      } else {
        const id = crypto.randomUUID();
        await db.datasetUnits.add({
          id,
          campaignId: session.campaignId,
          taskId: session.taskId,
          sceneId: session.sceneId,
          demonstratorId: demoId,
          targetEpisodes: target,
          status: "open",
        });
        setUnitId(id);
      }
    })().catch(console.error);
  }, [session, quota]);

  // ── camera ────────────────────────────────────────────────────────────────
  const { videoRef, stream, status: cameraStatus, errorMessage, retry } = useWebcam();

  // ── hand tracking ─────────────────────────────────────────────────────────
  const { canvasRef, latestResultRef, trackerStatus } = useHandTracker(
    videoRef,
    cameraStatus === "ready"
  );

  // ── recording ─────────────────────────────────────────────────────────────
  // Refs for stale-closure-safe reads inside callbacks
  const unitIdRef = useRef<string | null>(null);
  const demonstratorIdRef = useRef<string | null>(null);
  unitIdRef.current = unitId;
  demonstratorIdRef.current = demonstratorId;
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const taskRef = useRef(task);
  taskRef.current = task;
  const trackerStatusRef = useRef(trackerStatus);
  trackerStatusRef.current = trackerStatus;
  // Placeholder ref so handleBlob can call getEpisodeMetrics before it's defined
  const getEpisodeMetricsRef = useRef<() => { handVisibilityPct: number; avgConfidence: number; framingOk: boolean }>(
    () => ({ handVisibilityPct: 0, avgConfidence: 0, framingOk: false })
  );
  const setAwaitingResetRef = useRef(setAwaitingReset);
  // Track take number for toast without causing re-renders
  const takeCountRef = useRef(0);

  const handleBlob = useCallback(
    async (blob: Blob, durationSec: number) => {
      const uid = unitIdRef.current;
      const demoId = demonstratorIdRef.current;
      const sess = sessionRef.current;
      if (!uid || !demoId || !sess) return;

      const blobKey = crypto.randomUUID();
      try {
        await db.transaction("rw", [db.blobs, db.episodes], async () => {
          await db.blobs.add({ key: blobKey, blob });
          await db.episodes.add({
            id: crypto.randomUUID(),
            unitId: uid,
            campaignId: sess.campaignId,
            taskId: sess.taskId,
            sceneId: sess.sceneId,
            demonstratorId: demoId,
            videoBlobKey: blobKey,
            durationSec,
            qualityMetrics:
              trackerStatusRef.current === "error"
                ? { handVisibilityPct: 0, avgConfidence: 0, framingOk: false, trackingAvailable: false }
                : getEpisodeMetricsRef.current(),
            qaStatus: "pending",
            createdAt: new Date().toISOString(),
          });
        });
        takeCountRef.current += 1;
        toast.success("Episode saved", {
          description: `Take ${takeCountRef.current} recorded successfully.`,
        });
        if (taskRef.current?.resetType === "reset") {
          setAwaitingResetRef.current(true);
        }
      } catch (err) {
        console.error("Failed to save episode:", err);
        toast.error("Failed to save episode", {
          description: "Check the console for details.",
        });
      }
    },
    [] // stable — reads via refs
  );

  const { recordingState, elapsedSec, start, stop } = useMediaRecorder(
    stream,
    handleBlob
  );

  // ── quality metrics ───────────────────────────────────────────────────────
  const minConf = qualityCriteria?.minTrackingConfidence ?? 0.6;
  const { signals, getEpisodeMetrics } = useQualityMetrics(
    latestResultRef,
    recordingState === "recording",
    task?.bimanual ?? false,
    minConf
  );
  // Keep ref in sync so handleBlob always calls the current version
  getEpisodeMetricsRef.current = getEpisodeMetrics;

  // ── episode count + unit completion ──────────────────────────────────────
  const episodeCount = useLiveQuery<number>(
    async () => (unitId ? db.episodes.where("unitId").equals(unitId).count() : 0),
    [unitId],
    0
  );

  useEffect(() => {
    if (!unitId || !episodeCount || episodeCount < targetEpisodes) return;
    db.datasetUnits.update(unitId, { status: "complete" }).catch(console.error);
  }, [episodeCount, targetEpisodes, unitId]);

  // ── render ─────────────────────────────────────────────────────────────────
  if (!session) return null;

  const tc = TIER_CONFIG[session.tier];
  const recordingDisabled =
    cameraStatus !== "ready" || !unitId || !demonstratorId || awaitingReset;

  function handleEndSession() {
    stop(); // stop any active recording before leaving
    clearSession();
    router.push("/capture");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-5">
      {/* Session header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-base font-semibold leading-tight">
            {task?.name ?? "…"}
          </h1>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs text-muted-foreground">
              {task?.bimanual ? "Bimanual" : "Single-hand"}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="font-mono text-xs text-muted-foreground">
              {task?.horizonSeconds}s horizon
            </span>
            <span className="text-muted-foreground/40">·</span>
            <Badge variant="outline" className={`${tc.badgeCls} py-0 text-[10px]`}>
              {tc.label}
            </Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={handleEndSession}
        >
          End session
        </Button>
      </div>

      {/* Camera preview with hand-tracking canvas overlay */}
      <CameraPreview
        videoRef={videoRef}
        canvasRef={canvasRef}
        status={cameraStatus}
        trackerStatus={trackerStatus}
        errorMessage={errorMessage}
        onRetry={retry}
        signals={signals}
      />

      {/* Task instructions + exemplar */}
      <TaskPanel task={task} />

      {/* Reset prompt — shown after each episode when resetType='reset' */}
      {awaitingReset && <ResetPrompt onDone={() => setAwaitingReset(false)} />}

      {/* Record button */}
      <RecordButton
        recordingState={recordingState}
        elapsedSec={elapsedSec}
        disabled={recordingDisabled}
        onStart={start}
        onStop={stop}
      />

      {/* Episode list */}
      <EpisodeList unitId={unitId} targetEpisodes={targetEpisodes} />
    </div>
  );
}
