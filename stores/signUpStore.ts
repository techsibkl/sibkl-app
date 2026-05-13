import { OtpChannel } from "@/services/OTP/otp.service";
import { create } from "zustand";

type PendingSignUp = {
  email: string;
  password: string;
};
type SignUpState = {
  pendingSignUp: PendingSignUp | null;
  otpChannel: OtpChannel;
  setPendingSignUp: (data: PendingSignUp | null) => void;
  setOtpChannel: (channel: OtpChannel) => void;
};

export const useSignUpStore = create<SignUpState>((set) => ({
  pendingSignUp: null,
  otpChannel: "email",
  setPendingSignUp: (data) => set({ pendingSignUp: data }),
  setOtpChannel: (channel) => set({ otpChannel: channel }),
}));
