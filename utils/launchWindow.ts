import { AppStatus } from "@/types/SystemConfig";

/**
 * Whether the launch window is open for this client.
 *
 * Priority:
 *   1. status === "unlocked"  → open immediately (early start override)
 *   2. status === "locked"    → open only once launch_date has been reached
 *   3. no launch_date         → stay closed until status is unlocked
 *
 * Timer expiry is evaluated locally so every device unlocks at the same
 * ISO timestamp without waiting for a BE / Redis write.
 */
export function isLaunchWindowOpen(
	appStatus: AppStatus | null | undefined,
	now: number = Date.now(),
): boolean {
	if (!appStatus) return false;
	if (appStatus.status === "unlocked") return true;
	if (!appStatus.launch_date) return false;
	const launchAt = new Date(appStatus.launch_date).getTime();
	if (Number.isNaN(launchAt)) return false;
	return now >= launchAt;
}
