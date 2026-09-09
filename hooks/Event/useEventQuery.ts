import { fetchEvent } from "@/services/Event/event.service";
import { Event } from "@/services/Event/event.type";
import { useQuery } from "@tanstack/react-query";

export const useEventQuery = (eventId: string | number | undefined) => {
	return useQuery<Event>({
		queryKey: ["events", eventId],
		queryFn: () => fetchEvent(eventId!),
		enabled: eventId != null && eventId !== "",
		retry: (failureCount, error: any) => {
			if (error?.status === 401 || error?.status === 403) {
				return false;
		}
			return failureCount < 3;
		},
	});
};
