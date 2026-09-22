import Constants from "expo-constants";

/**
 * Build-time pilot flag from app.config.ts extra.
 * EAS env vars are strings; default to false (production-safe).
 */
const isPilotBuild =
	Constants.expoConfig?.extra?.PILOT_BUILD === true ||
	Constants.expoConfig?.extra?.PILOT_BUILD === "true";

/**
 * Binary-level feature gates (build-time only).
 *
 * These are HARD guards – a feature cannot appear in a non-pilot binary even
 * if the server-driven DB flag is enabled. They are intentionally a separate
 * layer from the runtime flags in `useSystemStore` / `useFeatureFlag`.
 *
 * Layering model:
 *   1. binaryFeatureFlags  – hard binary guard (this file, build-time)
 *   2. useFeatureFlag(key) – server-driven DB flag (runtime, from /system/config)
 *
 * For features that are pilot-only at the binary level, gate with BOTH:
 *   const canSee = binaryFeatureFlags.cells && useFeatureFlag("cells");
 *
 * For features that are not binary-restricted (available in all builds),
 * use useFeatureFlag(key) alone – no entry needed here.
 *
 * Do not check process.env.PILOT_BUILD in components.
 * Backend APIs still authenticate and authorize independently.
 */
export const binaryFeatureFlags = {
	isPilotBuild,
	/**
	 * Pilot binary gates are disabled. These stay true so existing call sites
	 * compile, and the server flag from useFeatureFlag is the real gate.
	 */
	cells: true,
	cellAttendance: true,
	cellFollowUp: true,
} as const;

export type binaryFeatureFlagKey = Exclude<
	keyof typeof binaryFeatureFlags,
	"isPilotBuild"
>;

if (__DEV__) {
	console.log(
		"[binaryFeatureFlags] isPilotBuild:",
		binaryFeatureFlags.isPilotBuild,
		"| binary gates:",
		{
			cells: binaryFeatureFlags.cells,
			cellAttendance: binaryFeatureFlags.cellAttendance,
			cellFollowUp: binaryFeatureFlags.cellFollowUp,
		},
	);
}
