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
    set({ isAuthenticated: true, isLoading: false });
    console.log("user was set:", user);
    return user;
  },

  // Register new account
  signUp: async (email: string, password: string) => {
    const { user } = await createUserWithEmailAndPassword(
      getAuth(),
      email,
      password
    );
    set({ isAuthenticated: true, isLoading: false });
    return user;
  },

  // Sign out
  signOut: async () => {
    await signOut(getAuth());
    set({ user: null, isAuthenticated: false });
    console.log("user has signed out:");
  },

  init: () => {
    onAuthStateChanged(getAuth(), async (firebaseUser) => {
      console.log("user:", firebaseUser);

      if (!firebaseUser) {
        set({
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
          user: appUser,
          isAuthenticated: false,
        });
        return;
      }

      try {
        const response = await secureFetch(apiEndpoints.getPersonOfUid, {
          method: "GET",
        });

        const json = await response.json();

        console.log("person info:", json);
        
        if (json.success && json.data) {
          appUser = {
            ...appUser,
            people_id: json.data.people_id,
            person: json.data,
          };
        } else {
          console.log("could not find a person matching your credentials");
        }
      } catch (error) {
        console.error("Failed to fetch person:", error);
      }

      set({
        user: appUser,
        isAuthenticated: !!appUser.person, // only true if profile is complete
        isLoading: false,
      });
    });
  },
}));
