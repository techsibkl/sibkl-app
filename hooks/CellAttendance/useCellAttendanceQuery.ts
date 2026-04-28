import {
  createCellSession,
  fetchCellSessionById,
  fetchCellSessions,
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
