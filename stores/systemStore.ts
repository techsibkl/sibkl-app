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
const ACTIVATED_VERSION_PATH = `${FileSystem.documentDirectory}activated_launch_version.txt`;

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

async function readActivatedLaunchVersion(): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(ACTIVATED_VERSION_PATH);
    if (!info.exists) return null;
    return await FileSystem.readAsStringAsync(ACTIVATED_VERSION_PATH);
  } catch {
    return null;
  }
}

async function writeActivatedLaunchVersion(version: string): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(ACTIVATED_VERSION_PATH, version);
  } catch (e) {
    console.warn("[systemStore] Failed to persist activated launch version:", e);
  }
}

async function clearActivatedLaunchVersion(): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(ACTIVATED_VERSION_PATH);
    if (info.exists) await FileSystem.deleteAsync(ACTIVATED_VERSION_PATH);
  } catch { /* ignore */ }
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
   * Called the moment the unlock animation plays. Persists the activated
   * launch_version to disk so the launch page restores the unlocked state
   * after a cold restart. The banner remains until acknowledgeLaunch().
   */
  activateLaunch: () => Promise<void>;
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

      const [seenVersion, activatedVersion] = await Promise.all([
        readSeenLaunchVersion(),
        readActivatedLaunchVersion(),
      ]);

      const currentVersion = config.app_status.launch_version;
      const hasNewLaunch = currentVersion !== seenVersion;
      // Restore persisted unlock state: the user already went through the
      // animation for this version, so skip the locked view on cold restart.
      const hasActivatedLaunch = activatedVersion === currentVersion;

      set({
        featureFlags: { ...DEFAULT_FLAGS, ...config.feature_flags },
        appStatus: config.app_status,
        isLoaded: true,
        hasNewLaunch,
        hasActivatedLaunch,
      });
    } catch (error) {
      console.error("[systemStore] fetchSystemConfig error:", error);
      set({ isLoaded: true });
    }
  },

  activateLaunch: async () => {
    const { appStatus } = get();
    if (appStatus?.launch_version) {
      await writeActivatedLaunchVersion(appStatus.launch_version);
    }
    set({ hasActivatedLaunch: true });
  },

  acknowledgeLaunch: async () => {
    const { appStatus } = get();
    if (!appStatus) return;
    await Promise.all([
      writeSeenLaunchVersion(appStatus.launch_version),
      clearActivatedLaunchVersion(),
    ]);
    set({ hasNewLaunch: false, hasActivatedLaunch: false });
  },
}));
