import { fetchEvents } from "@/services/Event/event.service";
import { Event } from "@/services/Event/event.type";
import { useQuery } from "@tanstack/react-query";

export const useEventsQuery = () => {
	return useQuery<Event[]>({
		queryKey: ["events"],
		queryFn: () => fetchEvents(),
		retry: (failureCount, error: any) => {
			if (error?.status === 401 || error?.status === 403) {
				return false;
			}
			return failureCount < 3;
		},
	});
};
