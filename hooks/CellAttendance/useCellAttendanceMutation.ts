import {
    createCellSession,
    manualSignInToCellSession,
    removeAttendeeFromSession,
    signInToCellSession,
} from "@/services/CellAttendance/cellAttendance.service";

import { CellSessionAttendee } from "@/services/CellAttendance/cellAttendance.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

			// Apply optimistic update
			queryClient.setQueryData(cacheKey, (oldData: any) => {
				if (!oldData) return oldData;

				const isCheckedIn =
					oldData.attendees?.some(
						(a: CellSessionAttendee) => a.people_id === peopleId,
					) ?? false;

				if (isCheckedIn) {
					// Remove from attendees (optimistic checkout)
					return {
						...oldData,
						attendees:
							oldData.attendees?.filter(
								(a: CellSessionAttendee) =>
									a.people_id !== peopleId,
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
		onError: (error, variables, context) => {
			// Revert optimistic update on error
			if (context?.previousData) {
				const cacheKey = [
					"cell-session",
					numericCellId,
					numericSessionId,
				];
				queryClient.setQueryData(cacheKey, context.previousData);
			}
		},
	});
};
