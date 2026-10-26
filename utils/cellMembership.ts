type MembershipFields = {
	status?: string | null;
	member_status?: string | null;
};

type ZoneLeaderCell = {
	zone_leader_1?: number | string | null;
	zone_leader_2?: number | string | null;
};

/**
 * Zone leaders are assigned on the cell (`zone_leader_1` / `zone_leader_2`),
 * not via `leader_of_cell_ids`. Ids may arrive as strings.
 */
export function isZoneLeaderOfCell(
	personId: number | string | null | undefined,
	cell?: ZoneLeaderCell | null,
): boolean {
	if (personId == null || personId === "") return false;
	const id = Number(personId);
	if (!Number.isFinite(id)) return false;
	return [cell?.zone_leader_1, cell?.zone_leader_2].some(
		(leaderId) =>
			leaderId != null && leaderId !== "" && Number(leaderId) === id,
	);
}

const BLOCKED = new Set(["REMOVED", "REJECTED", "PENDING"]);

const normalize = (value?: string | null) =>
	value ? String(value).toUpperCase() : undefined;

/**
 * Membership on a cell roster row. `member_status` wins when both fields
 * disagree, so a removed row is not treated as active.
 */
export function getCellMembershipStatus(
	member?: MembershipFields | null,
	personCell?: { member_status?: string | null } | null,
): string | null {
	const values = [
		normalize(member?.member_status),
		normalize(member?.status),
		normalize(personCell?.member_status),
	].filter((value): value is string => Boolean(value));

	if (values.includes("REMOVED")) return "REMOVED";
	if (values.includes("REJECTED")) return "REJECTED";
	if (values.includes("PENDING")) return "PENDING";
	if (values.includes("ACTIVE") || member) return "ACTIVE";
	return null;
}

export function canCheckInToCell(options: {
	member?: MembershipFields | null;
	personCell?: { member_status?: string | null } | null;
	/** When the cell roster has loaded, people missing from it cannot check in. */
	rosterLoaded?: boolean;
}): boolean {
	const status = getCellMembershipStatus(options.member, options.personCell);
	if (status && BLOCKED.has(status)) return false;
	if (options.rosterLoaded && !options.member) return false;
	if (status === "ACTIVE" || options.member) return true;
	return !options.rosterLoaded;
}

export function cellCheckInBlockedMessage(options?: {
	name?: string;
	status?: string | null;
}): string {
	const status = options?.status?.toUpperCase();
	const name = options?.name;

	if (!name) {
		if (status === "REMOVED") {
			return "You can't check in because you were removed from this cell.";
		}
		if (status === "PENDING") {
			return "You can't check in until your membership is approved.";
		}
		return "You can't check in because you're not an active member of this cell.";
	}

	if (status === "REMOVED") {
		return `${name} was removed from this cell and can't be checked in.`;
	}
	if (status === "PENDING") {
		return `${name} can't be checked in until their membership is approved.`;
	}
	return `${name} can't be checked in because they are not an active member of this cell.`;
}

export function cellAttendanceErrorMessage(
	error: { message?: string; err_code?: string } | null | undefined,
	fallback: string,
	name?: string,
): string {
	if (error?.err_code === "SESSION_CLOSED") {
		return "This session is closed. Attendance is frozen.";
	}
	if (error?.err_code === "SESSION_NOT_STARTED") {
		return "Check-in opens on the meeting day.";
	}
	if (error?.err_code === "NOT_A_MEMBER") {
		return name
			? `${name} can't be checked in because they are not an active member of this session.`
			: "You can't check in because you're not an active member of this session.";
	}
	return error?.message || fallback;
}
