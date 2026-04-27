import {
  fetchCellSessionById,
  fetchCellSessions,
} from "@/services/CellAttendance/cellAttendance.service";
import { useQuery } from "@tanstack/react-query";

export const useCellSessionsQuery = (cellId: number) => {
  return useQuery({
    queryKey: ["cell-sessions", cellId],
    queryFn: () => fetchCellSessions(cellId),
    enabled: !!cellId,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const useCellSessionByIdQuery = (cellId: number, sessionId: number) => {
  return useQuery({
    queryKey: ["cell-session", cellId, sessionId],
    queryFn: () => fetchCellSessionById(cellId, sessionId),
    enabled: !!cellId && !!sessionId,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 3;
    },
  });
};
