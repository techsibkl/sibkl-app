/** Calendar day in the device timezone, `YYYY-MM-DD`. */
export function formatLocalDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * A picker `Date`, a `YYYY-MM-DD` calendar day, or an ISO instant.
 * Date-only strings stay on that calendar day. Instants use the local day,
 * so a local-midnight value serialized with `toISOString()` is not shifted
 * to the previous day.
 */
export function parseCalendarDate(value: unknown): Date | null {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : value;
	}
	if (typeof value !== "string") return null;

	const trimmed = value.trim();
	if (!trimmed) return null;

	const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
	if (dateOnly) {
		const year = Number(dateOnly[1]);
		const month = Number(dateOnly[2]);
		const day = Number(dateOnly[3]);
		const date = new Date(year, month - 1, day);
		if (
			date.getFullYear() !== year ||
			date.getMonth() !== month - 1 ||
			date.getDate() !== day
		) {
			return null;
		}
		return date;
	}

	const parsed = new Date(trimmed);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Value saved for a calendar-date field. Null when the value is not a date. */
export function toCalendarDateString(value: unknown): string | null {
	const date = parseCalendarDate(value);
	return date ? formatLocalDate(date) : null;
}
