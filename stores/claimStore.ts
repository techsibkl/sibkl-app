import { MaskedPerson } from "@/services/Person/person.type";
import { create } from "zustand";

export type ClaimVerificationChannel = "email" | "sms";

interface ClaimState {
  selectedProfile: MaskedPerson | null;
  verificationChannel: ClaimVerificationChannel | null;
  setSelectedProfile: (profile: MaskedPerson | null) => void;
  setVerificationChannel: (channel: ClaimVerificationChannel | null) => void;
  reset: () => void;
}

export const useClaimStore = create<ClaimState>((set) => ({
  selectedProfile: null,
  verificationChannel: null,
  setSelectedProfile: (profile) => set({ selectedProfile: profile }),
  setVerificationChannel: (channel) => set({ verificationChannel: channel }),
  reset: () => set({ selectedProfile: null, verificationChannel: null }),
}));
