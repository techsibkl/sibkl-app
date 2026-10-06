import { FeatureFlags } from "@/types/SystemConfig";
import { useSystemStore } from "@/stores/systemStore";

/**
 * Returns the enabled state of a feature flag.
 *
 * Source of truth: API /system/config (always wins when it succeeds).
 * Fallback: Last-known flags persisted to disk (UX smoothing while network loads).
 * First install: No disk cache → flags default to false until first successful fetch.
 *
 * Launch-gate: When a new launch cycle is detected (hasNewLaunch = true),
 * all flags return false until the user completes "Refresh to Unlock"
 * (hasActivatedLaunch = true). This keeps the bottom nav hidden in sync with
 * the LaunchBanner.
 *
 * Usage:
 *   const canSeeCells = useFeatureFlag("cells");
 */
export const useFeatureFlag = (key: keyof FeatureFlags): boolean => {
  const { featureFlags, hasNewLaunch, hasActivatedLaunch } = useSystemStore();
  const flagEnabled = featureFlags[key] ?? false;
  // If a launch cycle is pending, gate behind activation.
  const launchGatePassed = !hasNewLaunch || hasActivatedLaunch;
  return flagEnabled && launchGatePassed;
};
