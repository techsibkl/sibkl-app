import { fetchMyEventRegistrations } from "@/services/Event/event.service";
import { EventRegistration } from "@/services/Event/event.type";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";

type UseMyEventRegistrationsQueryOptions = {
	/** When false, query does not run (e.g. until My Events tab is selected). Default: true */
	enabled?: boolean;
};

export const useMyEventRegistrationsQuery = (
	options?: UseMyEventRegistrationsQueryOptions,
) => {
	const isGuest = useAuthStore((state) => state.isGuest);
	const user = useAuthStore((state) => state.user);
	const firebaseUser = useAuthStore((state) => state.firebaseUser);
	const personId = user?.person?.id;
	const peopleId = user?.people_id;

	const enabled = (options?.enabled ?? true) && !isGuest;

	return useQuery<EventRegistration[]>({
		queryKey: ["events", "mine", personId],
		queryFn: async () => {
			console.log("[MyEvents] fetching GET /events/myEvents", {
				personId,
				peopleId,
				firebaseUid: firebaseUser?.uid,
				email: user?.email,
			});
			const result = await fetchMyEventRegistrations();
			console.log("[MyEvents] fetch complete", {
				personId,
				count: result.length,
				eventIds: result.map((r) => r.event.id),
			});
			return result;
		},
		enabled,
		retry: (failureCount, error: any) => {
			if (error?.status === 401 || error?.status === 403) return false;
			return failureCount < 3;
		},
	});
};