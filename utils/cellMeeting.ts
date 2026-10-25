import { Cell } from "@/services/Cell/cell.types";

const WEEKDAY_INDEX: Record<string, number> = {
	Sunday: 0,
	Monday: 1,
	Tuesday: 2,
	Wednesday: 3,
	Thursday: 4,
	Friday: 5,
	Saturday: 6,
};

export type NextCellMeeting = {
	cell: Cell;
	nextDate: Date;
	displayTime: string;
};

export function getPrimaryActiveCell(cells: Cell[] | undefined): Cell | null {
	const active = (cells ?? []).filter((c) => c.member_status === "ACTIVE");
	if (active.length === 0) return null;
	return active[0];
}

export function getNextMeetingOccurrence(
	meetingDay: string,
): Date | null {
	const target = WEEKDAY_INDEX[meetingDay];
	if (target === undefined) return null;

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const current = today.getDay();
	let diff = target - current;
	if (diff < 0) diff += 7;

	const next = new Date(today);
	next.setDate(today.getDate() + diff);
	return next;
}

export function formatMeetingTimeLabel(
	meetingTime?: string | null,
	fMeetingTime?: string | null,
): string {
	if (fMeetingTime) return fMeetingTime;
	if (!meetingTime) return "";
	return meetingTime;
}

export function getNextCellMeeting(
	cells: Cell[] | undefined,
): NextCellMeeting | null {
	const cell = getPrimaryActiveCell(cells);
	if (!cell?.meeting_day) return null;

	const nextDate = getNextMeetingOccurrence(cell.meeting_day);
	if (!nextDate) return null;

	const displayTime = formatMeetingTimeLabel(
		cell.meeting_time,
		cell.f_meeting_time,
	);
	if (!displayTime) return null;

	return { cell, nextDate, displayTime };
}

export function formatCompactDateBadge(date: Date): {
	day: string;
	month: string;
} {
	return {
		day: date.getDate().toString().padStart(2, "0"),
		month: date
			.toLocaleDateString("en-MY", { month: "short" })
			.toUpperCase(),
	};
}
