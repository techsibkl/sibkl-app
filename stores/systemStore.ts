import * as FileSystem from "expo-file-system";
import { create } from "zustand";
import { getSystemConfig } from "@/services/System/system.service";
import { AppStatus, FeatureFlags, SystemConfig } from "@/types/SystemConfig";

// ---------------------------------------------------------------------------
// Persistence helpers (expo-file-system – already in project deps)
// Launch versions + last-known feature flags.
// Flags are fallback-only (UX smoothing). API is source of truth.
// ---------------------------------------------------------------------------

const SEEN_VERSION_PATH = `${FileSystem.documentDirectory}seen_launch_version.txt`;
const ACTIVATED_VERSION_PATH = `${FileSystem.documentDirectory}activated_launch_version.txt`;
const FEATURE_FLAGS_PATH = `${FileSystem.documentDirectory}system_feature_flags.json`;

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

async function readPersistedFeatureFlags(): Promise<FeatureFlags | null> {
  try {
    const info = await FileSystem.getInfoAsync(FEATURE_FLAGS_PATH);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(FEATURE_FLAGS_PATH);
    const parsed = JSON.parse(raw) as Partial<FeatureFlags>;
    if (!parsed || typeof parsed !== "object") return null;
    return { ...DEFAULT_FLAGS, ...parsed };
  } catch {
    return null;
  }
}

async function writePersistedFeatureFlags(flags: FeatureFlags): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(FEATURE_FLAGS_PATH, JSON.stringify(flags));
  } catch (e) {
    console.warn("[systemStore] Failed to persist feature flags:", e);
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

/**
 * First-install fallback only. After the first successful /config fetch,
 * last-known flags are restored from disk so tabs can render immediately.
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
  /** True once disk flags have been applied (or confirmed missing). */
  isHydrated: boolean;
  /**
   * True when the server's launch_version differs from the last version
   * persisted to disk. Gate the launch animation on this flag.
   */
  hasNewLaunch: boolean;
  /**
   * True once the user has completed "Refresh to Unlock" for the current
   * launch_version. Restored from disk on cold start.
   */
  hasActivatedLaunch: boolean;

  /** Restore last-known flags from disk. Safe to call multiple times. */
  hydratePersistedFlags: () => Promise<void>;
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
  isHydrated: false,
  hasNewLaunch: false,
  hasActivatedLaunch: false,

  hydratePersistedFlags: async () => {
    if (get().isHydrated || get().isLoaded) return;
    const persisted = await readPersistedFeatureFlags();
    // Fetch may have finished while we were reading disk — don't clobber it.
    if (get().isLoaded) {
      set({ isHydrated: true });
      return;
    }
    // Disk = UX smoothing fallback only. API is the source of truth.
    if (persisted) {
      set({ featureFlags: persisted, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },

  fetchSystemConfig: async () => {
    // Show last-known flags for UX smoothness while network loads.
    // Once API returns, it immediately replaces disk (API is source of truth).
    await get().hydratePersistedFlags();

    try {
      const config: SystemConfig | null = await getSystemConfig();

      if (!config) {
        // Network failed — keep hydrated/persisted flags as fallback.
        // Do not reset to DEFAULT_FLAGS (that would hide everything).
        set({ isLoaded: true });
        return;
      }

      const [seenVersion, activatedVersion] = await Promise.all([
        readSeenLaunchVersion(),
        readActivatedLaunchVersion(),
      ]);

      const currentVersion = config.app_status.launch_version;
      const hasNewLaunch = currentVersion !== seenVersion;

      // hasActivatedLaunch is true when:
      //   a) the user completed the unlock animation for this version (disk), OR
      //   b) the server says status is "unlocked" — treat as a remote activation
      //      so the banner and feature flags update immediately without requiring
      //      the user to manually refresh on the lock screen.
      const diskActivated = activatedVersion === currentVersion;
      const remoteUnlocked = config.app_status.status === "unlocked";
      const hasActivatedLaunch = diskActivated || remoteUnlocked;

      // Persist remote activation to disk so a cold restart restores the state.
      if (remoteUnlocked && !diskActivated) {
        await writeActivatedLaunchVersion(currentVersion);
      }

      const featureFlags = { ...DEFAULT_FLAGS, ...config.feature_flags };

      // API flags are the source of truth — they replace disk immediately.
      set({
        featureFlags,
        appStatus: config.app_status,
        isLoaded: true,
        hasNewLaunch,
        hasActivatedLaunch,
      });
      // Persist API flags for next cold start.
      await writePersistedFeatureFlags(featureFlags);
    } catch (error) {
      console.error("[systemStore] fetchSystemConfig error:", error);
      // Network failed — keep hydrated/persisted flags, mark loaded.
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

// Restore last-known flags as soon as this module loads (splash/auth),
// so the tab bar does not wait on /system/config.
void useSystemStore.getState().hydratePersistedFlags();

