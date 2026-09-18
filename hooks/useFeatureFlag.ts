import { FeatureFlags } from "@/types/SystemConfig";
import { useSystemStore } from "@/stores/systemStore";

/**
 * Returns the server-driven enabled state of a feature flag.
 *
 * Returns false while the config is still loading, ensuring features stay
 * hidden until the server explicitly enables them (safe default).
 *
 * Usage:
 *   const canSeeCells = useFeatureFlag("cells");
 */
export const useFeatureFlag = (key: keyof FeatureFlags): boolean => {
  const featureFlags = useSystemStore((state) => state.featureFlags);
  return featureFlags[key] ?? false;
};
