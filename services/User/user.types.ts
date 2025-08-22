import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { Person } from "../Person/person.type";
import { ProfileFormData } from "@/app/(auth)/complete-profile";

// Example state with Zustand
export type AuthState = {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AppUser | null) => void;
  signIn: (
    email: string,
    password: string
  ) => Promise<FirebaseAuthTypes.User | null>;
  signUp: (
    email: string,
    password: string,
    profileData: ProfileFormData
  ) => Promise<FirebaseAuthTypes.User | null>;
  signOut: () => Promise<void>;
  init: () => void;
};

export interface AppUser {
  uid?: string;
  email: string;
  people_id: number;
  person: Person | null;
}
