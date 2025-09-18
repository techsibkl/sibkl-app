import { MaskedPerson } from "@/services/Person/person.type";
import { create } from "zustand";


interface ClaimState {
  selectedProfile: MaskedPerson | null;
  setSelectedProfile: (profile: MaskedPerson | null) => void;
  reset: () => void;
}

export const useClaimStore = create<ClaimState>((set) => ({
  selectedProfile: null,
  setSelectedProfile: (profile) => set({ selectedProfile: profile }),
  reset: () => set({ selectedProfile: null }),
}));
