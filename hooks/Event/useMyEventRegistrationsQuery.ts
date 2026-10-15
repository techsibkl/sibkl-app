import {
	claimMyEvents,
	fetchMyEventRegistrations,
} from "@/services/Event/event.service";
import { EventRegistration } from "@/services/Event/event.type";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";

type UseMyEventRegistrationsQueryOptions = {
	/** When false, query does not run. Default: true */
	enabled?: boolean;
};

type ClaimEntry = {
	promise: Promise<EventRegistration[]>;
	settled: boolean;
};

/** One claim per signed-in account for this app session. Later reads use GET. */
const claimsByUser = new Map<string, ClaimEntry>();

function claimMyEventsOnce(
	userKey: string,
): Promise<EventRegistration[] | null> {
	const existing = claimsByUser.get(userKey);
	if (existing?.settled) return Promise.resolve(null);
	if (existing) return existing.promise;

	const entry: ClaimEntry = {
		settled: false,
		promise: claimMyEvents()
			.then((result) => {
				entry.settled = true;
				console.log("[MyEvents] claim complete", {
					claimed: result.claimed,
					count: result.registrations.length,
				});
				return result.registrations;
			})
			.catch((error) => {
				claimsByUser.delete(userKey);
				throw error;
			}),
	};
	claimsByUser.set(userKey, entry);
	return entry.promise;
}

export const useMyEventRegistrationsQuery = (
	options?: UseMyEventRegistrationsQueryOptions,
) => {
	const isGuest = useAuthStore((state) => state.isGuest);
	const user = useAuthStore((state) => state.user);
	const firebaseUser = useAuthStore((state) => state.firebaseUser);
	const personId = user?.person?.id;
	const peopleId = user?.people_id;

	const enabled = (options?.enabled ?? true) && !isGuest;

	const userKey = firebaseUser?.uid ?? "signed-in";

	return useQuery<EventRegistration[]>({
		queryKey: ["events", "mine", personId],
		queryFn: async () => {
			const claimed = await claimMyEventsOnce(userKey);
			if (claimed !== null) {
				console.log("[MyEvents] populated from claim", {
					personId,
					peopleId,
					firebaseUid: firebaseUser?.uid,
					count: claimed.length,
					eventIds: claimed.map((r) => r.event.id),
				});
				return claimed;
			}

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
			if (
				error?.status === 400 ||
				error?.status === 401 ||
				error?.status === 403
			) {
				return false;
			}
			return failureCount < 3;
		},
	});
};