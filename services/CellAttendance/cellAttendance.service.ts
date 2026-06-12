import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";
import { CellSession, CellSessionDetail } from "./cellAttendance.type";

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

export const createCellSession = async (
  cellId: number,
  meetingDate: string,
  force = false,
): Promise<{ insertedId: number }> => {
  const response = await secureFetch(apiEndpoints.cells.createSession(cellId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cell_id: cellId,
      meeting_date: meetingDate,
      ...(force ? { force: true } : {}),
    }),
  });
  const json: ReturnVal = await response.json();
  if (!json.success) throw json;
  const insertedId = json.data?.insertedId ?? json.data?.session_id;
  if (insertedId == null) {
    throw { ...json, message: json.message ?? "No session id returned from server" };
  }
  return { insertedId: Number(insertedId) };
};

export const fetchCellSessions = async (
  cellId: number,
): Promise<CellSession[]> => {
  const response = await secureFetch(apiEndpoints.cells.getSessions(cellId));
  const json: ReturnVal = await response.json();
  if (!json.success) throw json;
  return (json.data as CellSession[]) ?? [];
};

export const fetchCellSessionById = async (
  cellId: number,
  sessionId: number,
): Promise<CellSessionDetail> => {
  const response = await secureFetch(
    apiEndpoints.cells.getSessionById(cellId, sessionId),
  );
  const json: ReturnVal = await response.json();
  if (!json.success) throw json;
  return json.data as CellSessionDetail;
};
