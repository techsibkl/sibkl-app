import { registerEventParticipant } from "@/services/Event/event.service";
import {
	EventParticipant,
	EventParticipantWritePayload,
} from "@/services/Event/event.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEventRegistrationMutation = (eventId: string | number) => {
	const queryClient = useQueryClient();

	return useMutation<
		EventParticipant,
		{ status?: number; message?: string; err_code?: string },
		EventParticipantWritePayload
	>({
		mutationFn: (payload) => registerEventParticipant(eventId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["events", "mine"] });
			queryClient.invalidateQueries({ queryKey: ["events", eventId] });
		},
	});
};
