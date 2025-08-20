import { FirebaseAuthTypes } from "@react-native-firebase/auth";

// Example state with Zustand
export type AuthState = {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  signIn: (email: string, password: string) => Promise<FirebaseAuthTypes.User | null>;
  signUp: (email: string, password: string) => Promise<FirebaseAuthTypes.User | null>;
  signOut: () => Promise<void>;
  init: () => void;
};

export interface AppUser {
  uid?: string;
  email: string;
  people_id: number;
//   person: Person | null;
}