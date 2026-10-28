import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export interface DownloadEntry {
  lessonId: string;
  courseId: string;
  title: string;
  sizeBytes: number;
  /** Local metadata only — the actual media is fetched through a signed,
   * expiring URL and never stored as a permanent public link. */
  encryptedLocalRef: string;
  progressPercent: number;
  status: "queued" | "downloading" | "completed" | "failed";
}

interface DownloadsState {
  downloads: Record<string, DownloadEntry>;
  hydrate: () => Promise<void>;
  upsert: (entry: DownloadEntry) => void;
  remove: (lessonId: string) => void;
  totalStorageBytes: () => number;
}

const STORAGE_KEY = "cwk_downloads";

export const useDownloadsStore = create<DownloadsState>((set, get) => ({
  downloads: {},

  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) set({ downloads: JSON.parse(raw) });
  },

  upsert: (entry) => {
    const next = { ...get().downloads, [entry.lessonId]: entry };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ downloads: next });
  },

  remove: (lessonId) => {
    const next = { ...get().downloads };
    delete next[lessonId];
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ downloads: next });
  },

  totalStorageBytes: () => Object.values(get().downloads).reduce((sum, d) => sum + d.sizeBytes, 0),
}));
