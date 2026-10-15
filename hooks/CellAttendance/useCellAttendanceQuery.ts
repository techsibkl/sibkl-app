import {
	addCellMembers,
	toggleCoreMember,
	updateMemberStatus,
} from "@/services/Cell/cell.service";
import { Cell } from "@/services/Cell/cell.types";
import {
  fetchCellAttendanceStats,
  fetchCellSessionById,
  fetchCellSessions,
  fetchPersonCellAttendanceStats,
  fetchPersonSessionAttendance,
} from "@/services/CellAttendance/cellAttendance.service";
import { CellSession } from "@/services/CellAttendance/cellAttendance.type";
import { Person } from "@/services/Person/person.type";
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

export const useCellAttendanceStatsQuery = (cellId: number, enabled = true) => {
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

export const useAddCellMembersMutation = (cellId: number) => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (payload: {
			cellId: number;
			people: Person[];
			reactivateIds?: number[];
		}) => {
			const reactivate = new Set(payload.reactivateIds ?? []);
			const toAdd = payload.people.filter((p) => !reactivate.has(p.id));
			const toReactivate = payload.people.filter((p) =>
				reactivate.has(p.id),
			);

			if (toAdd.length > 0) {
				try {
					await addCellMembers(payload.cellId, toAdd);
				} catch {
					// Batch add can fail if a removed membership row still exists.
					for (const person of toAdd) {
						try {
							await addCellMembers(payload.cellId, [person]);
						} catch {
							await updateMemberStatus(
								payload.cellId,
								person.id,
								"ACTIVE",
							);
						}
					}
				}
			}
			for (const person of toReactivate) {
				await updateMemberStatus(payload.cellId, person.id, "ACTIVE");
			}
		},
		onSuccess: async (_res, variables) => {
			await qc.cancelQueries({ queryKey: ["cells", variables.cellId] });
			qc.setQueryData(
				["cells", variables.cellId],
				(oldData: Cell | undefined) => {
					if (!oldData) return oldData;

					const selectedIds = new Set(
						variables.people.map((p) => p.id),
					);
					const existing = oldData.members ?? [];
					const updatedExisting = existing.map((m) =>
						selectedIds.has(m.id)
							? {
									...m,
									status: "ACTIVE",
									member_status: "ACTIVE" as const,
								}
							: m,
					);
					const existingIds = new Set(existing.map((m) => m.id));
					const added = variables.people
						.filter((p) => !existingIds.has(p.id))
						.map((p) => ({
							...p,
							status: "ACTIVE",
							member_status: "ACTIVE" as const,
						}));

					return {
						...oldData,
						members: [...updatedExisting, ...added],
					};
				},
			);
			qc.invalidateQueries({
				queryKey: ["cell-sessions", variables.cellId],
			});
			qc.invalidateQueries({
				queryKey: ["cell-session", variables.cellId],
			});
		},
	});
};

export const useToggleCoreMemberMutation = (cellId: number) => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (payload: { memberIds: number[]; isCore: boolean }) =>
			toggleCoreMember(cellId, payload.memberIds, payload.isCore),
		onSuccess: (res) => {
			qc.setQueryData(["cells", cellId], (oldData: Cell) => {
				if (!oldData) return oldData;

				return {
					...oldData,
					members: res,
				};
			});
		},
	});
};
