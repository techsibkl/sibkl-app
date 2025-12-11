import { Person } from "@/services/Person/person.type";
import { AppUser } from "@/services/User/user.types";
import { AuthState } from "@/stores/authStore";
import { defineAbilityFor, Role } from "@/utils/casl/defineAbilityFor";
import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

export const handleAuthStateChange = async (
	firebaseUser: FirebaseAuthTypes.User | null,
	set: {
		(
			partial:
				| AuthState
				| Partial<AuthState>
				| ((state: AuthState) => AuthState | Partial<AuthState>),
			replace?: false
		): void;
		(
			state: AuthState | ((state: AuthState) => AuthState),
			replace: true
		): void;
	}
) => {
	if (!firebaseUser) {
		set({
			firebaseUser: null,
			user: null,
			isAuthenticated: false,
			isLoading: false,
			authLoaded: true,
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

	try {
		const response = await secureFetch(apiEndpoints.users.getPersonOfUid, {
			method: "GET",
		});

		const json = await response.json();
		if (json.success && json.data) {
			appUser = {
				...appUser,
				people_id: json.data.id,
				person: json.data,
			};
		} else {
			// Add toast
			console.log("could not find a person matching your credentials");
		}
	} catch (error) {
		// ADd toast
		console.error("Failed to fetch person:", error);
	} finally {
		let person: Person =
			appUser?.person ?? <Person>{ id: 0, roles: [Role.NONE] };

		const ability = defineAbilityFor(person);
		set({
			firebaseUser: firebaseUser,
			user: appUser,
			isAuthenticated: !!appUser.person, // only true if profile is complete
			isLoading: false,
			authLoaded: true,
			ability: ability,
		});
	}
};
