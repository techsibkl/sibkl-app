import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";
import {
  CellAttendanceStat,
  CellSession,
  CellSessionDetail,
} from "./cellAttendance.type";

export const signInToCellSession = async (
	cellId: number,
	attendanceId: string,
	peopleId: number,
): Promise<void> => {
	const response = await secureFetch(
		apiEndpoints.cells.signInToSession(cellId),
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				attendance_id: attendanceId,
				people_id: peopleId,
			}),
		},
	);
	const json: ReturnVal = await response.json();
	if (!json.success) throw json;
};

// Manual check-in
export const manualSignInToCellSession = async (
	cellId: number,
	attendanceId: string,
	peopleId: number,
): Promise<void> => {
	const response = await secureFetch(
		apiEndpoints.cells.manualSignIn(cellId),
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				attendance_id: attendanceId,
				people_id: peopleId,
			}),
		},
	);
	const json: ReturnVal = await response.json();
	if (!json.success) throw json;
};

// Remove attendee from session
export const removeAttendeeFromSession = async (
	cellId: number,
	attendanceId: string,
	peopleId: number,
): Promise<void> => {
	const response = await secureFetch(
		apiEndpoints.cells.removeAttendee(cellId),
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				attendance_id: attendanceId,
				people_id: peopleId,
			}),
		},
	);
	const json: ReturnVal = await response.json();
	if (!json.success) throw json;
};

export const createCellSession = async (
	cellId: number,
	meetingDate: string,
): Promise<{ insertedId: number }> => {
	const response = await secureFetch(
		apiEndpoints.cells.createSession(cellId),
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				cell_id: cellId,
				meeting_date: meetingDate,
			}),
		},
	);
	const json: ReturnVal = await response.json();
	if (!json.success) throw json;
	return json.data as { insertedId: number };
};

export const fetchCellSessions = async (
	cellId: number,
): Promise<CellSession[]> => {
	const response = await secureFetch(apiEndpoints.cells.getSessions(cellId));
	const json: ReturnVal = await response.json();
	if (!json.success) throw json;
	const rows = Array.isArray(json.data) ? json.data : [];
	return rows.map((item: CellSession) => ({
		...item,
		attendee_count: Number(item.attendee_count ?? 0),
		member_count: Number(item.member_count ?? 0),
		guest_count: Number(item.guest_count ?? 0),
		total_members: Number(item.total_members ?? 0),
		status: item.status ?? "open",
	}));
};

export const fetchCellSessionById = async (
	cellId: number,
	sessionId: number,
): Promise<CellSessionDetail> => {
	const response = await secureFetch(
		apiEndpoints.cells.getSessionById(cellId, sessionId),
	);
	const json: ReturnVal = await response.json();
	return json.data as CellSessionDetail;
};

export const fetchCellAttendanceStats = async (
	cellId: number,
): Promise<CellAttendanceStat[]> => {
	const response = await secureFetch(
		apiEndpoints.cells.getAttendanceStats(cellId),
	);
	const json: ReturnVal = await response.json();
	if (!json.success) throw json;
	const rows = Array.isArray(json.data) ? json.data : [];
	return rows.map((item: CellAttendanceStat) => ({
		cell_id: Number(item.cell_id),
		people_id: Number(item.people_id),
		full_legal_name: item.full_legal_name ?? "",
		sessions_attended: Number(item.sessions_attended ?? 0),
		total_sessions: Number(item.total_sessions ?? 0),
		attendance_rate: Number(item.attendance_rate ?? 0),
	}));
};

export const fetchPersonCellAttendanceStats = async (
	cellId: number,
	peopleId: number,
): Promise<CellAttendanceStat> => {
	const response = await secureFetch(
		apiEndpoints.cells.getAttendanceStatsByPerson(cellId, peopleId),
	);
	const json: ReturnVal = await response.json();
	if (!json.success) throw json;
	const item = json.data as CellAttendanceStat;
	return {
		cell_id: Number(item.cell_id),
		people_id: Number(item.people_id),
		full_legal_name: item.full_legal_name ?? "",
		sessions_attended: Number(item.sessions_attended ?? 0),
		total_sessions: Number(item.total_sessions ?? 0),
		attendance_rate: Number(item.attendance_rate ?? 0),
	};
};

export const fetchPersonSessionAttendance = async (
	cellId: number,
	sessions: CellSession[],
	peopleId: number,
): Promise<Record<number, boolean>> => {
	const attendanceMap: Record<number, boolean> = {};

	for (const session of sessions) {
		const detail = await fetchCellSessionById(cellId, session.id);
		const isAttended =
			detail.attendees?.some(
				(attendee) => attendee.people_id === peopleId,
			) ?? false;
		attendanceMap[session.id] = isAttended;
	}

	return attendanceMap;
};
