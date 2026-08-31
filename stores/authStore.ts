import { ProfileFormData } from "@/app/(auth)/complete-profile";
import { handleAuthStateChange } from "@/hooks/Auth/useAuthHandler";
import { createAccount, getPersonOfUid } from "@/services/Auth/auth.service";
import { Person } from "@/services/Person/person.type";
import { AppUser } from "@/services/User/user.types";
import { defineAbilityFor, Role } from "@/utils/casl/defineAbilityFor";
import { AnyAbility } from "@casl/ability";
import {
	FirebaseAuthTypes,
	getAuth,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
} from "@react-native-firebase/auth";
import { create } from "zustand";

/** Unsubscribe from the previous Firebase auth listener when re-running init (avoids stacked listeners). */
let unsubscribeAuthState: (() => void) | null = null;

// Example state with Zustand
export type AuthState = {
	firebaseUser: FirebaseAuthTypes.User | null;
	user: AppUser | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	isGuest: boolean;
	authLoaded: boolean;
	ability: AnyAbility;
	setFirebaseUser: (firebaseUser: FirebaseAuthTypes.User | null) => void;
	setUser: (user: AppUser | null) => void;
	signIn: (
		email: string,
		password: string,
	) => Promise<FirebaseAuthTypes.User | null | undefined>;
	signUp: (
		profileData: ProfileFormData,
	) => Promise<FirebaseAuthTypes.User | null | undefined>;
	guestLogin: () => void;
	signOut: () => Promise<void>;
	init: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
	firebaseUser: null,
	user: null,
	isLoading: true,
	isAuthenticated: false,
	isGuest: false,
	authLoaded: false,
	ability: defineAbilityFor(<Person>{ id: 0, roles: [Role.NONE] }),

	setUser: (user: AppUser | null) =>
		set({
			user,
			isAuthenticated: !!user,
			isLoading: false,
		}),

	setFirebaseUser: (firebaseUser: FirebaseAuthTypes.User | null) =>
		set({ firebaseUser: firebaseUser }),

	// Sign in with email + password
	signIn: async (email: string, password: string) => {
		try {
			const res = await signInWithEmailAndPassword(
				getAuth(),
				email,
				password,
			);
			set({ firebaseUser: res?.user });
			set({ authLoaded: false, isGuest: false });
			await handleAuthStateChange(res?.user ?? null, set);
			return res?.user;
		} catch (error: FirebaseAuthTypes.NativeFirebaseAuthError | any) {
			if (error.code === "auth/invalid-credential") {
				throw "Email or password is incorrect. Please try again.";
			} else {
				throw "Failed to sign in. Please try again.";
			}
		}
	},

	// Register new account
	signUp: async (profileData: Partial<Person>) => {
		set({ authLoaded: false, isGuest: false });
		try {
			const { firebaseUser } = get();

			if (!firebaseUser) {
				throw new Error(`No Firebase User Found`);
			}

			// 2. Create profile in backend
			const resCreate = await createAccount(profileData);

			if (!resCreate.success) {
				throw new Error(
					resCreate.message || "Account creation failed on backend",
				);
			}

			const resPerson = await getPersonOfUid();

			if (!resPerson.success || !resPerson.data) {
				throw new Error(
					"Could not find a person matching your credentials",
				);
			}

			// 4. Build appUser object
			const appUser: AppUser = {
				uid: firebaseUser.uid,
				email: firebaseUser.email ?? "",
				people_id: resPerson.data.people_id,
				person: resPerson.data as Person,
			};

			set({
				isAuthenticated: true,
				user: appUser,
				authLoaded: true,
			});

			return firebaseUser;
		} catch (error) {
			console.error("SignUp error:", error);
			// Reset auth state if something failed mid-way
			set({ isAuthenticated: false, user: null, authLoaded: true });
			return null;
		}
	},

	// Guest login
	guestLogin: () => {
		set({
			isGuest: true,
			isAuthenticated: false,
			firebaseUser: null,
			user: null,
			authLoaded: true,
			ability: defineAbilityFor(<Person>{ id: 0, roles: [Role.NONE] }),
			isLoading: false,
		});
	},

	// Sign out
	signOut: async () => {
		await signOut(getAuth());
		set({
			firebaseUser: null,
			user: null,
			isAuthenticated: false,
			isGuest: false,
		});
	},

	init: () => {
		unsubscribeAuthState?.();
		unsubscribeAuthState = null;
		set({ authLoaded: false, isGuest: false });
		unsubscribeAuthState = onAuthStateChanged(
			getAuth(),
			async (firebaseUser) => {
				await handleAuthStateChange(firebaseUser, set);
			},
		);
	},
}));
