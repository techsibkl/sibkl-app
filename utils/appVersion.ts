/**
 * True when `installed` is an older major.minor.patch than `required`.
 * Accepts an optional leading "v". Invalid values do not count as older,
 * so a bad payload cannot block the app.
 */
export function isVersionLower(installed: string, required: string): boolean {
	const parse = (value: string): number[] | null => {
		const trimmed = value.trim().replace(/^v/i, "");
		if (!/^\d+\.\d+\.\d+$/.test(trimmed)) return null;
		return trimmed.split(".").map(part => Number(part));
	};

	const current = parse(installed);
	const target = parse(required);
	if (!current || !target) return false;

	for (let index = 0; index < 3; index += 1) {
		if (current[index] < target[index]) return true;
		if (current[index] > target[index]) return false;
	}
	return false;
}
