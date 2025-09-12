import { create } from "zustand";

export interface FoundProfile {
  id: string;
  full_name: string;
  email: string;
}

interface ClaimState {
  foundProfiles: FoundProfile[];
  selectedProfile: FoundProfile | null;
  setFoundProfiles: (profiles: FoundProfile[]) => void;
  setSelectedProfile: (profile: FoundProfile | null) => void;
  reset: () => void;
}

export const useClaimStore = create<ClaimState>((set) => ({
  foundProfiles: [],
  selectedProfile: null,
  setFoundProfiles: (profiles) => set({ foundProfiles: profiles }),
  setSelectedProfile: (profile) => set({ selectedProfile: profile }),
  reset: () => set({ foundProfiles: [], selectedProfile: null }),
}));
