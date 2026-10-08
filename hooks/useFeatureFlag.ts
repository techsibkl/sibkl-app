import { useMsLeft } from "@/components/Launch/CountdownDisplay";
import { useSystemStore } from "@/stores/systemStore";
import { FeatureFlags } from "@/types/SystemConfig";

/**
 * Returns the enabled state of a feature flag.
 *
 * Source of truth: API /system/config (always wins when it succeeds).
 * Fallback: Last-known flags persisted to disk (UX smoothing while network loads).
 * First install: No disk cache → flags default to false until first successful fetch.
 *
 * Launch-gate: When a new launch cycle is detected (hasNewLaunch = true),
 * flags stay hidden until the launch window is open:
 *   - BE status === "unlocked" (early start), or
 *   - countdown launch_date has been reached locally, or
 *   - the user already completed "Refresh to Unlock" for this version.
 *
 * Usage:
 *   const canSeeCells = useFeatureFlag("cells");
 */
export const useFeatureFlag = (key: keyof FeatureFlags): boolean => {
  const { featureFlags, hasNewLaunch, hasActivatedLaunch, appStatus } =
    useSystemStore();
  const flagEnabled = featureFlags[key] ?? false;

  // Tick locally while locked so tabs open at T=0 without a BE write.
  const launchDate =
    hasActivatedLaunch || appStatus?.status === "unlocked"
      ? null
      : (appStatus?.launch_date ?? null);
  const msLeft = useMsLeft(launchDate);
  const windowOpen =
    appStatus?.status === "unlocked" ||
    (launchDate != null && msLeft === 0);

  const launchGatePassed = !hasNewLaunch || hasActivatedLaunch || windowOpen;
  return flagEnabled && launchGatePassed;
};
