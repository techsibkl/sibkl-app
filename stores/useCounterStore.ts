// src/stores/useCounterStore.ts
import { create } from "zustand";

type CounterStore = {
  count: number;
  increase: () => void;
};

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
}));
