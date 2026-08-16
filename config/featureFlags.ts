import Constants from "expo-constants";

/**
 * Build-time pilot flag from app.config.ts extra.
 * EAS env vars are strings; default to false (production-safe).
 */
const isPilotBuild =
	Constants.expoConfig?.extra?.PILOT_BUILD === true ||
	Constants.expoConfig?.extra?.PILOT_BUILD === "true";

const SHOW = true;
/**
 * Centralized feature flags for the current binary.
 *
 * All pilot-only features derive from PILOT_BUILD. To add a new pilot
 * feature, add a flag here and gate UI with `featureFlags.yourFlag`.
 * Do not check process.env.PILOT_BUILD in components.
 *
 * These flags control frontend availability only. Backend APIs must
 * still authenticate and authorize independently.
 */
export const featureFlags = {
	isPilotBuild,
	cells: isPilotBuild,
	cellFollowUp: SHOW,
	cellAttendance: isPilotBuild,
} as const;

export type FeatureFlagKey = Exclude<keyof typeof featureFlags, "isPilotBuild">;

if (__DEV__) {
	console.log(
		"[featureFlags] isPilotBuild:",
		featureFlags.isPilotBuild,
		"| flags:",
		{
			cells: featureFlags.cells,
			cellFollowUp: featureFlags.cellFollowUp,
			cellAttendance: featureFlags.cellAttendance,
		},
	);
}
