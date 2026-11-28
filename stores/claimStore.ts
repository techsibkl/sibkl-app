import { MaskedPerson, UnclaimedSuggestion } from "@/services/Person/person.type";
import { create } from "zustand";

export type ClaimVerificationChannel = "email" | "sms";

interface ClaimState {
  selectedProfile: MaskedPerson | null;
  verificationChannel: ClaimVerificationChannel | null;
  /** Short-lived proof from email OTP verify. Memory only. */
  claimToken: string | null;
  /** Null until a suggest call has finished. An empty array means no match. */
  suggestions: UnclaimedSuggestion[] | null;
  setSelectedProfile: (profile: MaskedPerson | null) => void;
  setVerificationChannel: (channel: ClaimVerificationChannel | null) => void;
  setClaimSession: (
    token: string,
    suggestions: UnclaimedSuggestion[] | null,
  ) => void;
  reset: () => void;
}

const cleared = {
  selectedProfile: null as MaskedPerson | null,
  verificationChannel: null as ClaimVerificationChannel | null,
  claimToken: null as string | null,
  suggestions: null as UnclaimedSuggestion[] | null,
};

export const useClaimStore = create<ClaimState>((set) => ({
  ...cleared,
  setSelectedProfile: (profile) => set({ selectedProfile: profile }),
  setVerificationChannel: (channel) => set({ verificationChannel: channel }),
  setClaimSession: (claimToken, suggestions) =>
    set({
      claimToken,
      suggestions,
      selectedProfile: null,
      verificationChannel: "email",
    }),
  reset: () => set({ ...cleared }),
}));
