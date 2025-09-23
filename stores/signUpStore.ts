import { create } from "zustand";

type PendingSignUp = {
  email: string;
  password: string;
};
type SignUpState = {
  pendingSignUp: PendingSignUp | null;
  // claimedPerson:
  setPendingSignUp: (data: PendingSignUp | null) => void;
};

export const useSignUpStore = create<SignUpState>((set) => ({
  pendingSignUp: null,
  setPendingSignUp: (data) => set({ pendingSignUp: data }),
}));
