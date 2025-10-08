import { getAuth, getIdToken } from "@react-native-firebase/auth"; // or "@react-native-firebase/auth" v22 modular style

export async function secureFetch(
	input: RequestInfo,
	init: RequestInit = {},
	options: { allowUnauthenticated?: boolean } = {}
) {
	const auth = getAuth();
	const user = auth.currentUser;
	if (!user && !options.allowUnauthenticated)
		throw new Error("SecureFetch: User not signed in");

	// New modular API: call getIdToken() as a function
	const token = await getIdToken(user!);
	// const token = await user?.getIdToken(); // still a method call

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
