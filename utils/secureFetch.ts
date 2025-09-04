import { getAuth } from "@react-native-firebase/auth"; // or "@react-native-firebase/auth" v22 modular style

export async function secureFetch(input: RequestInfo, init: RequestInit = {}) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not signed in");

  // New modular API: call getIdToken() as a function
  const token = await user.getIdToken(); // still a method call

  // console.log("token", token)

  const headers = {
    ...init.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(input, {
    ...init,
    headers,
  });

  return res;
}
