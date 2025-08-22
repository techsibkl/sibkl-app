import { create } from "zustand";

type Step1SignUpData = {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
};

type SignUpState = {
  step1Data: Step1SignUpData;
  setData: (values: Partial<Step1SignUpData>) => void;
  reset: () => void;
};

export const signUpStore = create<SignUpState>((set) => ({
  step1Data: {},
  setData: (values) =>
    set((state) => ({ step1Data: { ...state.step1Data, ...values } })),
  reset: () => set({ step1Data: {} }),
}));
