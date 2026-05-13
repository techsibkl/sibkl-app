import { getAuth, getIdToken } from "@react-native-firebase/auth";
import { useAuthStore } from "@/stores/authStore";

export async function secureFetch(
	input: RequestInfo,
	init: RequestInit = {},
	options: { allowUnauthenticated?: boolean } = {}
) {
	const auth = getAuth();
	const user = auth.currentUser;
	const { isGuest } = useAuthStore.getState();

	// Allow guest users to make requests, but don't require auth
	if (!user && !isGuest && !options.allowUnauthenticated)
		throw new Error("SecureFetch: User not signed in");

	// Only fetch token for authenticated users (not guests)
	let token: string | undefined = undefined;
	if (user && !isGuest) token = await getIdToken(user);

	const headers = {
		...init.headers,
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		"Content-Type": "application/json",
	};

	const res = await fetch(input, {
		...init,
		headers,
	});

	return res;
}
