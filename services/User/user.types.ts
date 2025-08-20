import { FirebaseAuthTypes } from "@react-native-firebase/auth";

// Example state with Zustand
export type AuthState = {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  signOut: () => Promise<void>;
};

export interface AppUser {
  uid?: string;
  email: string;
  people_id: number;
//   person: Person | null;
}