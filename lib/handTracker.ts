import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

export type { HandLandmarkerResult };

const WASM_CDN =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

// Module-level singleton — reused for the lifetime of the browser tab.
let instance: HandLandmarker | null = null;
let initPromise: Promise<HandLandmarker> | null = null;

async function createLandmarker(delegate: "GPU" | "CPU"): Promise<HandLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate },
    runningMode: "VIDEO",
    numHands: 2,
  });
}

/**
 * Returns the shared HandLandmarker instance, initializing it on first call.
 * Tries GPU first; falls back to CPU if the GPU delegate is unavailable.
 */
export async function getHandLandmarker(): Promise<HandLandmarker> {
  if (instance) return instance;

  if (!initPromise) {
    initPromise = createLandmarker("GPU")
      .catch(() => createLandmarker("CPU"))
      .then((lm) => {
        instance = lm;
        return lm;
      })
      .catch((err) => {
        initPromise = null; // allow retry
        throw err;
      });
  }

  return initPromise;
}

/** Free GPU/WASM memory. Call when leaving the capture flow. */
export function closeHandLandmarker(): void {
  instance?.close();
  instance = null;
  initPromise = null;
}

// Re-export the connections array so callers don't need to import the class.
export const HAND_CONNECTIONS = HandLandmarker.HAND_CONNECTIONS;
