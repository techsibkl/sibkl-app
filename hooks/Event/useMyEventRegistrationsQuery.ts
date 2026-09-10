import { fetchMyEventRegistrations } from "@/services/Event/event.service";
import { EventRegistration } from "@/services/Event/event.type";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";

export const useMyEventRegistrationsQuery = () => {
	const personId = useAuthStore((state) => state.user?.person?.id);

	return useQuery<EventRegistration[]>({
		queryKey: ["events", "mine", personId],
		queryFn: () => fetchMyEventRegistrations(personId!),
		enabled: personId != null && personId > 0,
		retry: (failureCount, error: any) => {
			if (error?.status === 401 || error?.status === 403) {
				return false;
			}
			return failureCount < 3;
		},
	});
};
