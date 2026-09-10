import { checkInEventParticipant } from "@/services/Event/event.service";
import { EventParticipant } from "@/services/Event/event.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEventCheckInMutation = (eventId: string | number) => {
	const queryClient = useQueryClient();

	return useMutation<
		EventParticipant,
		{ status?: number; message?: string; err_code?: string },
		string | number
	>({
		mutationFn: (participantId) =>
			checkInEventParticipant(eventId, participantId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["events", "mine"] });
			queryClient.invalidateQueries({ queryKey: ["events", eventId] });
		},
	});
};
