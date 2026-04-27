import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";
import { CellSession, CellSessionDetail } from "./cellAttendance.type";

export const fetchCellSessions = async (
  cellId: number,
): Promise<CellSession[]> => {
  const response = await secureFetch(apiEndpoints.cells.getSessions(cellId));
  const json: ReturnVal = await response.json();
  return (json.data as CellSession[]) ?? []; // ← fallback to empty array
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
