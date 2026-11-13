import SharedBody from "@/components/shared/SharedBody";
import { sendOTP, sendSmsOTP } from "@/services/OTP/otp.service";
import { useClaimStore } from "@/stores/claimStore";
import { useSignUpStore } from "@/stores/signUpStore";
import { useRouter } from "expo-router";
import { Mail, MessageSquare } from "lucide-react-native";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

/** Returns true when the string looks like a usable email address. */
const hasValidEmail = (email?: string | null): boolean =>
	!!email && email.includes("@") && email.trim().length > 0;

/** Returns true when the string has at least 7 digits (a plausible phone number). */
const hasValidPhone = (phone?: string | null): boolean => {
	if (!phone) return false;
	return phone.replace(/\D/g, "").length >= 7;
};

const Page = () => {
	const router = useRouter();
	const { selectedProfile, setVerificationChannel } = useClaimStore();
	const signUpStore = useSignUpStore();
	const [emailLoading, setEmailLoading] = useState(false);
	const [smsLoading, setSmsLoading] = useState(false);

	const emailEnabled = hasValidEmail(selectedProfile?.email);
	const phoneEnabled = hasValidPhone(selectedProfile?.phone);

	const handleVerifyViaEmail = async () => {
		if (!selectedProfile) return;
		setEmailLoading(true);
		try {
			const result = await sendOTP(selectedProfile.id, null);
			if (!result?.success) {
				Alert.alert(
					"Error",
					result?.message ?? "Failed to send OTP. Please try again.",
				);
				return;
			}
			signUpStore.setPendingSignUp({ email: "", password: "" });
			setVerificationChannel("email");
			router.push("/(auth)/verify-otp");
		} catch (err: any) {
			Alert.alert("Error", err.message ?? "Failed to send OTP.");
		} finally {
			setEmailLoading(false);
		}
	};

	const handleVerifyViaSms = async () => {
		if (!selectedProfile) return;
		setSmsLoading(true);
		try {
			const result = await sendSmsOTP(selectedProfile.id);
			if (!result?.success) {
				Alert.alert(
					"Error",
					result?.message ??
						"Failed to send SMS OTP. Please try again.",
				);
				return;
			}
			// Drop a leftover new-account email so it cannot be treated as the
			// login address chosen on the next screen.
			signUpStore.setPendingSignUp({ email: "", password: "" });
			setVerificationChannel("sms");
			router.push("/(auth)/verify-otp");
		} catch (err: any) {
			Alert.alert("Error", err.message ?? "Failed to send SMS OTP.");
		} finally {
			setSmsLoading(false);
		}
	};

	const showUnavailableDialog = (type: "email" | "sms") => {
		if (type === "email") {
			Alert.alert(
				"Email Unavailable",
				"No valid email address is associated with this profile. Please contact your cell leader or an administrator to update your contact information.",
				[{ text: "OK" }],
			);
		} else {
			Alert.alert(
				"Phone Unavailable",
				"No valid phone number is associated with this profile. Please contact your cell leader or an administrator to update your contact information.",
				[{ text: "OK" }],
			);
		}
	};

	return (
		<SharedBody>
			<KeyboardAwareScrollView
				className="flex-1 bg-background p-6"
				enableOnAndroid={true}
				extraScrollHeight={5}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<View className="gap-y-4">
					{selectedProfile && (
						<View className="bg-card rounded-2xl p-4 border border-border gap-y-1">
							<Text className="text-sm italic text-text-secondary mb-1">
								*Is this you? You are attempting to claim this
								profile.
							</Text>
							<Text className="font-semibold text-lg text-text">
								{selectedProfile.full_legal_name}
							</Text>
							<Text className="text-sm text-text-secondary">
								Phone: {selectedProfile.phone || "—"}
							</Text>
							<Text className="text-sm text-text-secondary">
								Email: {selectedProfile.email || "—"}
							</Text>
							{selectedProfile.migrate_extra_info ? (
								<Text className="text-sm text-text-secondary">
									Extra info:{" "}
									{selectedProfile.migrate_extra_info}
								</Text>
							) : null}
						</View>
					)}

					<Text className="text-base font-semibold text-text mt-2">
						Choose how to verify your identity:
					</Text>

					{/* Email verification button */}
					<TouchableOpacity
						onPress={
							emailEnabled
								? handleVerifyViaEmail
								: () => showUnavailableDialog("email")
						}
						disabled={emailLoading || smsLoading}
						className={`w-full rounded-2xl border p-4 flex-row items-center gap-x-3 ${
							emailEnabled
								? "bg-card border-primary-300"
								: "bg-muted border-border opacity-50"
						}`}
					>
						<View
							className={`w-10 h-10 rounded-full items-center justify-center ${
								emailEnabled ? "bg-primary-100" : "bg-muted"
							}`}
						>
							<Mail
								size={20}
								color={emailEnabled ? "#AC2212" : "#9ca3af"}
							/>
						</View>
						<View className="flex-1">
							<Text
								className={`font-semibold text-base ${
									emailEnabled
										? "text-text"
										: "text-muted-foreground"
								}`}
							>
								Verify via Email
							</Text>
							<Text className="text-xs text-text-secondary">
								{emailEnabled
									? `Send OTP to ${selectedProfile?.email}`
									: "No email on file"}
							</Text>
						</View>
						{emailLoading && <ActivityIndicator color="#AC2212" />}
					</TouchableOpacity>

					{/* SMS verification button */}
					<TouchableOpacity
						onPress={
							phoneEnabled
								? handleVerifyViaSms
								: () => showUnavailableDialog("sms")
						}
						disabled={emailLoading || smsLoading}
						className={`w-full rounded-2xl border p-4 flex-row items-center gap-x-3 ${
							phoneEnabled
								? "bg-card border-primary-300"
								: "bg-muted border-border opacity-50"
						}`}
					>
						<View
							className={`w-10 h-10 rounded-full items-center justify-center ${
								phoneEnabled ? "bg-primary-100" : "bg-muted"
							}`}
						>
							<MessageSquare
								size={20}
								color={phoneEnabled ? "#AC2212" : "#9ca3af"}
							/>
						</View>
						<View className="flex-1">
							<Text
								className={`font-semibold text-base ${
									phoneEnabled
										? "text-text"
										: "text-muted-foreground"
								}`}
							>
								Verify via SMS
							</Text>
							<Text className="text-xs text-text-secondary">
								{phoneEnabled
									? `Send OTP to ${selectedProfile?.phone}`
									: "No phone number on file"}
							</Text>
						</View>
						{smsLoading && <ActivityIndicator color="#AC2212" />}
					</TouchableOpacity>

					<Text className="text-xs text-text-secondary text-center mt-2">
						A one-time verification code will be sent to confirm
						your identity before you set your password.
					</Text>
				</View>
			</KeyboardAwareScrollView>
		</SharedBody>
	);
};

export default Page;
