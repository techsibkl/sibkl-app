import { fetchEvent } from "@/services/Event/event.service";
import { Event } from "@/services/Event/event.type";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useEventQuery = (eventId: string | number | undefined) => {
	const queryClient = useQueryClient();

	return useQuery<Event>({
		queryKey: ["events", eventId],
		queryFn: () => fetchEvent(eventId!),
		enabled: eventId != null && eventId !== "",
		// Seed from the list cache so navigation is instant and the detail always
		// reflects the most recent pull-to-refresh without a separate round-trip.
		initialData: () => {
			const list = queryClient.getQueryData<Event[]>(["events"]);
			return list?.find((e) => String(e.id) === String(eventId));
		},
		// Inherit the list query's freshness timestamp so TanStack Query knows
		// whether this seed data is still fresh or needs a background refetch.
		initialDataUpdatedAt: () =>
			queryClient.getQueryState(["events"])?.dataUpdatedAt,
		retry: (failureCount, error: any) => {
			if (error?.status === 401 || error?.status === 403) {
				return false;
			}
			return failureCount < 3;
		},
	});
};
