import { AuthState } from "@/services/User/user.types";
import auth from "@react-native-firebase/auth";
import { create } from "zustand";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !user,
      isLoading: false,
    }),

  signOut: async () => {
    auth().signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
