import {
    closeCellSession,
    createCellSession,
    manualSignInToCellSession,
    removeAttendeeFromSession,
    signInToCellSession,
} from "@/services/CellAttendance/cellAttendance.service";

import {
	CellSession,
	CellSessionAttendee,
	CellSessionDetail,
} from "@/services/CellAttendance/cellAttendance.type";
import {
	cellAttendanceErrorMessage,
	isSamePeopleId,
} from "@/utils/cellMembership";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const isSessionClosedError = (error: unknown) =>
	(error as { err_code?: string } | null)?.err_code === "SESSION_CLOSED";

const isFutureMeetingDay = (meetingDate?: string | null) => {
	if (!meetingDate) return false;
	const meetingDay = new Date(meetingDate);
	if (Number.isNaN(meetingDay.getTime())) return false;
	meetingDay.setHours(0, 0, 0, 0);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return meetingDay.getTime() > today.getTime();
};

/** Uses the loaded session snapshot. If it is not cached, the API decides. */
const assertSessionAllowsCheckIn = (
	queryClient: ReturnType<typeof useQueryClient>,
	cellId: number,
	sessionId: number,
	peopleId: number,
) => {
	if (!sessionId) return;
	const session = queryClient.getQueryData<CellSessionDetail>([
		"cell-session",
		cellId,
		sessionId,
	]);
	const list = queryClient.getQueryData<CellSession[]>([
		"cell-sessions",
		cellId,
	]);
	const meetingDate =
		session?.meeting_date ??
		list?.find((item) => item.id === sessionId)?.meeting_date;
	if (isFutureMeetingDay(meetingDate)) {
		throw {
			err_code: "SESSION_NOT_STARTED",
			message: cellAttendanceErrorMessage(
				{ err_code: "SESSION_NOT_STARTED" },
				"Check-in opens on the meeting day.",
			),
		};
	}
	if (!session) return;
	if (session.status === "closed") {
		throw {
			err_code: "SESSION_CLOSED",
			message: cellAttendanceErrorMessage(
				{ err_code: "SESSION_CLOSED" },
				"This session is closed.",
			),
		};
	}
	if (!Array.isArray(session.members)) return;
	const onRoster = session.members.some(
		(member) => Number(member.id) === Number(peopleId),
	);
	if (onRoster) return;
	throw {
		err_code: "NOT_A_MEMBER",
		message: cellAttendanceErrorMessage(
			{ err_code: "NOT_A_MEMBER" },
			"You can't check in because you're not an active member of this session.",
		),
	};
};

export const useCreateCellSessionMutation = (cellId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (meetingDate: string) =>
			createCellSession(cellId, meetingDate),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["cell-sessions", cellId],
			});
		},
	});
};

export const useSignInToCellSessionMutation = (cellId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			attendanceId,
			peopleId,
		}: {
			attendanceId: string;
			peopleId: number;
		}) => {
			assertSessionAllowsCheckIn(
				queryClient,
				cellId,
				Number(attendanceId),
				peopleId,
			);
			return signInToCellSession(cellId, attendanceId, peopleId);
		},
		onError: (error, variables) => {
			if (!isSessionClosedError(error)) return;
			const sessionId = Number(variables.attendanceId);
			queryClient.invalidateQueries({
				queryKey: ["cell-session", cellId, sessionId],
			});
			queryClient.invalidateQueries({
				queryKey: ["cell-sessions", cellId],
			});
		},
	});
};

export const useCloseCellSessionMutation = (
	cellId: number,
	sessionId: number,
) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => closeCellSession(cellId, sessionId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["cell-session", cellId, sessionId],
			});
			await queryClient.invalidateQueries({
				queryKey: ["cell-sessions", cellId],
			});
			await queryClient.invalidateQueries({
				queryKey: ["cell-attendance-stats", cellId],
			});
		},
	});
};

// // Manual sign in to cell session
// export const useManualSignInToCellSessionMutation = (cellId: number) => {
// 	return useMutation({
// 		mutationFn: ({
// 			attendanceId,
// 			peopleId,
// 		}: {
// 			attendanceId: string;
// 			peopleId: number;
// 		}) => manualSignInToCellSession(cellId, attendanceId, peopleId),
// 	});
// };

// // Remove attendee from cell session
// export const useRemoveAttendeeFromCellSessionMutation = (cellId: number) => {
// 	return useMutation({
// 		mutationFn: ({
// 			attendanceId,
// 			peopleId,
// 		}: {
// 			attendanceId: string;
// 			peopleId: number;
// 		}) => removeAttendeeFromSession(cellId, attendanceId, peopleId),
// 	});
// };

// Toggle member check-in/out with optimistic updates
export const useToggleMemberCheckInMutation = (
	numericCellId: number,
	numericSessionId: number,
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			attendanceId,
			peopleId,
			checkedIn,
		}: {
			attendanceId: string;
			peopleId: number;
			checkedIn: boolean;
		}) => {
			// Call appropriate API based on current state
			if (checkedIn) {
				await removeAttendeeFromSession(
					numericCellId,
					attendanceId,
					peopleId,
				);
			} else {
				assertSessionAllowsCheckIn(
					queryClient,
					numericCellId,
					numericSessionId,
					peopleId,
				);
				await manualSignInToCellSession(
					numericCellId,
					attendanceId,
					peopleId,
				);
			}

			return { checkedIn };
		},
		onMutate: ({ peopleId }) => {
			// Save previous state for rollback
			const cacheKey = ["cell-session", numericCellId, numericSessionId];
			const previousData: any = queryClient.getQueryData(cacheKey);
			const alreadyCheckedIn =
				previousData?.attendees?.some((attendee: CellSessionAttendee) =>
					isSamePeopleId(attendee.people_id, peopleId),
				) ?? false;

			if (!alreadyCheckedIn) {
				assertSessionAllowsCheckIn(
					queryClient,
					numericCellId,
					numericSessionId,
					peopleId,
				);
			}

			// Apply optimistic update
			queryClient.setQueryData(cacheKey, (oldData: any) => {
				if (!oldData) return oldData;

				const isCheckedIn =
					oldData.attendees?.some((a: CellSessionAttendee) =>
						isSamePeopleId(a.people_id, peopleId),
					) ?? false;

				if (isCheckedIn) {
					// Remove from attendees (optimistic checkout)
					return {
						...oldData,
						attendees:
							oldData.attendees?.filter(
								(a: CellSessionAttendee) =>
									!isSamePeopleId(a.people_id, peopleId),
							) ?? [],
						attendee_count: (oldData.attendee_count ?? 0) - 1,
					};
				} else {
					// Add to attendees (optimistic checkin)
					return {
						...oldData,
						attendees: [
							...(oldData.attendees ?? []),
							{
								id: Date.now(),
								people_id: peopleId,
								guest_name: null,
								guest_phone: null,
								is_present: 1,
								checked_in_at: new Date().toISOString(),
								invited_by_id: null,
							},
						],
						attendee_count: (oldData.attendee_count ?? 0) + 1,
					};
				}
			});

			return { previousData };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["cell-session", numericCellId, numericSessionId],
			});
			queryClient.invalidateQueries({
				queryKey: ["cell-sessions", numericCellId],
			});
		},
		onError: (error, _variables, context) => {
			// Revert optimistic update on error
			if (context?.previousData) {
				const cacheKey = [
					"cell-session",
					numericCellId,
					numericSessionId,
				];
				queryClient.setQueryData(cacheKey, context.previousData);
			}
			if (!isSessionClosedError(error)) return;
			queryClient.invalidateQueries({
				queryKey: ["cell-session", numericCellId, numericSessionId],
			});
		},
	});
};
