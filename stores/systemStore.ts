import * as FileSystem from "expo-file-system";
import { create } from "zustand";
import { getSystemConfig } from "@/services/System/system.service";
import { AppStatus, FeatureFlags, SystemConfig } from "@/types/SystemConfig";

// ---------------------------------------------------------------------------
// Persistence helpers (expo-file-system – already in project deps)
// We only persist the last-seen launch_version so we can detect launch events
// across cold starts without adding a new dependency.
// ---------------------------------------------------------------------------

const SEEN_VERSION_PATH = `${FileSystem.documentDirectory}seen_launch_version.txt`;

async function readSeenLaunchVersion(): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(SEEN_VERSION_PATH);
    if (!info.exists) return null;
    return await FileSystem.readAsStringAsync(SEEN_VERSION_PATH);
  } catch {
    return null;
  }
}

async function writeSeenLaunchVersion(version: string): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(SEEN_VERSION_PATH, version);
  } catch (e) {
    console.warn("[systemStore] Failed to persist seen launch version:", e);
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

/**
 * Safe defaults while the config is loading: all features hidden.
 * Once fetchSystemConfig resolves these are replaced by the server values.
 */
const DEFAULT_FLAGS: FeatureFlags = {
  people: false,
  guestFollowUp: false,
  leadersPage: false,
  cells: false,
  cellFollowUp: false,
  cellAttendance: false,
  events: false,
};

type SystemState = {
  featureFlags: FeatureFlags;
  appStatus: AppStatus | null;
  /** True once fetchSystemConfig has resolved (success or fallback). */
  isLoaded: boolean;
  /**
   * True when the server's launch_version differs from the last version
   * persisted to disk. Gate the launch animation on this flag.
   */
  hasNewLaunch: boolean;
  /**
   * In-memory flag (not persisted). Set to true the moment the user taps
   * "Refresh to Unlock" and the unlock animation plays. Allows the launch
   * page to start in the unlocked state on subsequent visits within the
   * same session, while keeping hasNewLaunch = true so the banner remains
   * visible until the user explicitly dismisses it.
   */
  hasActivatedLaunch: boolean;

  /** Fetch config from API, populate flags, and detect launch events. */
  fetchSystemConfig: () => Promise<void>;
  /**
   * Called the moment the unlock animation plays. Marks this session as
   * having seen the animation so the launch page can restore unlocked state.
   * Does NOT write to disk — the banner remains until acknowledgeLaunch().
   */
  activateLaunch: () => void;
  /**
   * Call after the launch animation / onboarding is dismissed.
   * Writes the current launch_version to disk so it won't trigger again.
   */
  acknowledgeLaunch: () => Promise<void>;
};

export const useSystemStore = create<SystemState>((set, get) => ({
  featureFlags: DEFAULT_FLAGS,
  appStatus: null,
  isLoaded: false,
  hasNewLaunch: false,
  hasActivatedLaunch: false,

  fetchSystemConfig: async () => {
    try {
      const config: SystemConfig | null = await getSystemConfig();

      if (!config) {
        // Network or parse failure – keep defaults, still mark loaded so the
        // app doesn't block forever on the loading gate.
        set({ isLoaded: true });
        return;
      }

      const seenVersion = await readSeenLaunchVersion();
      const hasNewLaunch = config.app_status.launch_version !== seenVersion;

      set({
        featureFlags: { ...DEFAULT_FLAGS, ...config.feature_flags },
        appStatus: config.app_status,
        isLoaded: true,
        hasNewLaunch,
      });
    } catch (error) {
      console.error("[systemStore] fetchSystemConfig error:", error);
      set({ isLoaded: true });
    }
  },

  activateLaunch: () => set({ hasActivatedLaunch: true }),

  acknowledgeLaunch: async () => {
    const { appStatus } = get();
    if (!appStatus) return;
    await writeSeenLaunchVersion(appStatus.launch_version);
    set({ hasNewLaunch: false, hasActivatedLaunch: false });
  },
}));
