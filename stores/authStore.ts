import { ProfileFormData } from "@/app/(auth)/complete-profile";
import { AppUser, AuthState } from "@/services/User/user.types";
import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "@react-native-firebase/auth";
import { create } from "zustand";

export const useAuthStore = create<AuthState>((set) => ({
	firebaseUser: null,
	user: null,
	isLoading: true,
	isAuthenticated: false,

	setUser: (user: AppUser | null) =>
		set({
			user,
			isAuthenticated: !!user,
			isLoading: false,
		}),

	// Sign in with email + password
	signIn: async (email: string, password: string) => {
		const { user } = await signInWithEmailAndPassword(
			getAuth(),
			email,
			password
		);
		set({ firebaseUser: user, isAuthenticated: true, isLoading: false });
		console.log("user was set:", user);
		return user;
	},

	// Register new account
	signUp: async (
		email: string,
		password: string,
		profileData: ProfileFormData
	) => {
		try {
			// 1. Create user in Firebase
			const { user } = await createUserWithEmailAndPassword(
				getAuth(),
				email,
				password
			);

			if (!user) {
				throw new Error(
					"User creation failed. No Firebase user returned."
				);
			}

			// 2. Create profile in backend
			const response = await secureFetch(
				`${apiEndpoints.users.createAccount}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(profileData),
				}
			);

			if (!response.ok) {
				throw new Error(
					`Backend account creation failed: ${response.status}`
				);
			}

			const data = await response.json();

			if (!data.success) {
				throw new Error(
					data.message || "Account creation failed on backend"
				);
			}

			const personResponse = await secureFetch(
				apiEndpoints.users.getPersonOfUid,
				{
					method: "GET",
				}
			);

			if (!personResponse.ok) {
				throw new Error(
					`Failed to fetch person: ${personResponse.status}`
				);
			}

			const personJson = await personResponse.json().catch(() => {
				throw new Error(
					"Failed to parse JSON from getPersonOfUid response"
				);
			});

			if (!personJson.success || !personJson.data) {
				throw new Error(
					"Could not find a person matching your credentials"
				);
			}

			// 4. Build appUser object
			const appUser = {
				uid: user.uid,
				email: user.email ?? "",
				people_id: personJson.data.people_id,
				person: personJson.data,
			};

			set({
				firebaseUser: user,
				isAuthenticated: true,
				isLoading: false,
				user: appUser,
			});

			return user;
		} catch (error) {
			console.error("SignUp error:", error);

			// Reset auth state if something failed mid-way
			set({ isAuthenticated: false, isLoading: false, user: null });

			return null;
		}
	},

	// Sign out
	signOut: async () => {
		await signOut(getAuth());
		set({ user: null, isAuthenticated: false });
	},

	init: () => {
		onAuthStateChanged(getAuth(), async (firebaseUser) => {
			if (!firebaseUser) {
				set({
					firebaseUser: null,
					user: null,
					isAuthenticated: false,
					isLoading: false,
				});
				return;
			}

			// default appUser from firebaseUser
			let appUser: AppUser = {
				uid: firebaseUser.uid,
				email: firebaseUser.email ?? "",
				people_id: 0,
				person: null,
			};

			if (!firebaseUser.emailVerified) {
				// here you might show toast / navigate to sign-up
				set({
					firebaseUser: firebaseUser,
					user: appUser,
					isAuthenticated: false,
				});
				return;
			}

			try {
				const response = await secureFetch(
					apiEndpoints.users.getPersonOfUid,
					{
						method: "GET",
					}
				);

				const json = await response.json();

				if (json.success && json.data) {
					appUser = {
						...appUser,
						people_id: json.data.people_id,
						person: json.data,
					};
				} else {
					console.log(
						"could not find a person matching your credentials"
					);
				}
			} catch (error) {
				console.error("Failed to fetch person:", error);
			}

			set({
				firebaseUser: firebaseUser,
				user: appUser,
				isAuthenticated: !!appUser.person, // only true if profile is complete
				isLoading: false,
			});
		});
	},
}));
