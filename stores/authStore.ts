import { AuthState } from "@/services/User/user.types";
import { createUserWithEmailAndPassword, FirebaseAuthTypes, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "@react-native-firebase/auth";
import { create } from "zustand";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user: FirebaseAuthTypes.User | null) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  // Sign in with email + password
  signIn: async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(getAuth(), email, password);
    set({ user, isAuthenticated: true, isLoading: false });
    console.log("user was set:", user)
    return user;
  },

  // Register new account
  signUp: async (email: string, password: string) => {
    const { user } = await createUserWithEmailAndPassword(getAuth(), email, password);
    set({ user, isAuthenticated: true, isLoading: false });
    return user;
  },

  // Sign out
  signOut: async () => {
    await signOut(getAuth());
    set({ user: null, isAuthenticated: false });
    console.log("user has signed out:", )
  },

  init:() => {
    onAuthStateChanged(getAuth(), (user) => {
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    })
  }

}));
