import { FeatureFlags } from "@/types/SystemConfig";
import { useSystemStore } from "@/stores/systemStore";

/**
 * Returns the server-driven enabled state of a feature flag.
 *
 * Returns false while the config is still loading, ensuring features stay
 * hidden until the server explicitly enables them (safe default).
 *
 * Launch-gate: when a new launch cycle is detected (hasNewLaunch = true),
 * all flags return false until the user has gone through the unlock animation
 * (hasActivatedLaunch = true). This keeps the bottom nav hidden in sync with
 * the LaunchBanner — features only become reachable after the user taps
 * "Refresh to Unlock" and the animation plays.
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
