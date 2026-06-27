import { create } from "zustand";

export interface CaptureSession {
  campaignId: string;
  taskId: string;
  sceneId: string;
  tier: 1 | 2 | 3;
}

interface CaptureStore {
  session: CaptureSession | null;
  setSession: (session: CaptureSession) => void;
  clearSession: () => void;
}

export const useCaptureStore = create<CaptureStore>()((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
}));
