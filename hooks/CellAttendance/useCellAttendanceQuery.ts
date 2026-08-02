import {
  createCellSession,
  fetchCellAttendanceStats,
  fetchCellSessionById,
  fetchCellSessions,
  fetchPersonCellAttendanceStats,
  fetchPersonSessionAttendance,
  signInToCellSession,
} from "@/services/CellAttendance/cellAttendance.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export const useCellAttendanceStatsQuery = (
  cellId: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["cell-attendance-stats", cellId],
    queryFn: () => fetchCellAttendanceStats(cellId),
    enabled: !!cellId && enabled,
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

export const usePersonCellAttendanceStatsQuery = (
  cellId: number,
  peopleId: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["person-cell-attendance-stats", cellId, peopleId],
    queryFn: () => fetchPersonCellAttendanceStats(cellId, peopleId),
    enabled: !!cellId && !!peopleId && enabled,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const usePersonSessionAttendanceQuery = (
  cellId: number,
  sessions: CellSession[],
  peopleId: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["person-session-attendance", cellId, peopleId],
    queryFn: () => fetchPersonSessionAttendance(cellId, sessions, peopleId),
    enabled: !!cellId && !!peopleId && sessions.length > 0 && enabled,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const useCreateCellSessionMutation = (cellId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meetingDate: string) => createCellSession(cellId, meetingDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cell-sessions", cellId] });
    },
  });
};

export const useSignInToCellSessionMutation = (cellId: number) => {
  return useMutation({
    mutationFn: ({
      attendanceId,
      peopleId,
    }: {
      attendanceId: string;
      peopleId: number;
    }) => signInToCellSession(cellId, attendanceId, peopleId),
  });
};
