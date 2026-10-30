import SharedBody from "@/components/shared/SharedBody";
import { Colors } from "@/constants/Colors";
import {
	sendOTP,
	sendSmsOTP,
	verifyOTP,
	verifySmsOTP,
} from "@/services/OTP/otp.service";
import { useClaimStore } from "@/stores/claimStore";
import { useSignUpStore } from "@/stores/signUpStore";
import {
	createUserWithEmailAndPassword,
	getAuth,
} from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import { Mail, MessageSquare } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const Page = () => {
	const router = useRouter();
	const claimStore = useClaimStore();
	const { pendingSignUp } = useSignUpStore();
	// Derive channel first so timer constants can reference it.
	// Require a selectedProfile — without one the SMS path has no person_id
	// to look up, so a stale verificationChannel="sms" (e.g. from an abandoned
	// claim) must not bleed into the new-account email-OTP flow.
	const isSmsChannel =
		claimStore.verificationChannel === "sms" && !!claimStore.selectedProfile;

	// SMS uses a longer initial cooldown (60 s) to match the backend enforced delay.
	const INITIAL_TIMER = isSmsChannel ? 60 : 30;
	// Backend window = 3 sends per 10 min. The initial send on selected-account
	// consumes 1, leaving 2 resends before the backend would reject.
	const MAX_RESENDS = isSmsChannel ? 2 : 3;

	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const [isLoading, setIsLoading] = useState(false);
	const [resendTimer, setResendTimer] = useState(INITIAL_TIMER);
	const [canResend, setCanResend] = useState(false);
	const [resendCount, setResendCount] = useState(0);

	const inputRefs = useRef<(TextInput | null)[]>([]);

	// Resend timer countdown
	useEffect(() => {
		if (resendTimer > 0) {
			const timer = setTimeout(
				() => setResendTimer(resendTimer - 1),
				1000,
			);
			return () => clearTimeout(timer);
		} else {
			setCanResend(true);
		}
	}, [resendTimer]);

	// Auto-submit when all 6 digits are entered
	useEffect(() => {
		if (otp.length === 6 && otp.every((digit) => digit !== "")) {
			handleVerifyOTP();
			inputRefs.current[5]?.blur();
		}
	}, [otp]);

	const handleOtpChange = (value: string, index: number) => {
		const digits = value.replace(/\D/g, "");

		// Paste or SMS/Gmail autofill: the whole code arrives in one field
		if (digits.length > 1) {
			const chars = digits.slice(0, 6).split("");
			const next = ["", "", "", "", "", ""];
			chars.forEach((char, i) => {
				next[i] = char;
			});
			setOtp(next);
			inputRefs.current[Math.min(chars.length, 5)]?.focus();
			return;
		}

		const next = [...otp];
		next[index] = digits;
		setOtp(next);

		if (digits && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyPress = (key: string, index: number) => {
		if (key === "Backspace" && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleVerifyOTP = async () => {
		const otpString = otp.join("");
		if (otpString.length !== 6) {
			Alert.alert("Invalid OTP", "Please enter a 6-digit code");
			return;
		}
		setIsLoading(true);

		try {
			const personId = claimStore.selectedProfile?.id ?? null;

			if (isSmsChannel) {
				// ── SMS OTP path (Twilio Verify) ──────────────────────────
				if (!personId) {
					Alert.alert(
						"Error",
						"No profile selected. Please go back and try again.",
					);
					return;
				}
				const result = await verifySmsOTP(personId, otpString);
				if (!result.success) {
					Alert.alert(
						"Invalid OTP",
						"The code you entered is incorrect or has expired. Please try again.",
					);
					setOtp(["", "", "", "", "", ""]);
					inputRefs.current[0]?.focus();
					return;
				}
				// email may be empty when the person has no email on record —
				// pass as empty string so the field in claim-set-password is
				// blank (editable) rather than pre-filled with "undefined".
				const resEmail = (result.data as any)?.email?.trim() ?? "";
				router.push(
					`/(auth)/claim-set-password?full_email=${encodeURIComponent(resEmail)}&id=${personId}`,
				);
			} else {
				// ── Email OTP path (existing flow) ─────────────────────────
				const email = pendingSignUp?.email || null;
				const result = await verifyOTP(personId, email, otpString);

				if (!result.success) {
					Alert.alert(
						"Invalid OTP",
						"The code you entered is incorrect. Please try again.",
					);
					setOtp(["", "", "", "", "", ""]);
					inputRefs.current[0]?.focus();
					return;
				}

				const resEmail = result.data?.email.trim() ?? "";

				if (claimStore.selectedProfile) {
					router.push(
						`/(auth)/claim-set-password?full_email=${encodeURIComponent(resEmail)}&id=${claimStore.selectedProfile.id}`,
					);
				} else {
					// No claimed profile, proceed to complete profile
					await createUserWithEmailAndPassword(
						getAuth(),
						resEmail,
						pendingSignUp?.password!,
					);
					router.push("/(auth)/complete-profile");
				}
			}
		} catch (error: any) {
			if (error.code == "auth/email-already-in-use") {
				Alert.alert(
					"Email Already In Use",
					"The email is already in use by another account. Try logging in instead.",
				);
			} else {
				Alert.alert("Error", "Failed to verify OTP. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendOTP = async () => {
		if (!canResend || resendCount >= MAX_RESENDS) return;

		try {
			setResendTimer(INITIAL_TIMER);
			setCanResend(false);

			if (isSmsChannel && claimStore.selectedProfile) {
				const result = await sendSmsOTP(claimStore.selectedProfile.id);
				if (!result?.success) {
					// Backend rate-limit rejection — surface the message directly
					Alert.alert(
						"Too Many Requests",
						result?.message ??
							"Please wait before requesting another code.",
					);
					setResendTimer(0);
					setCanResend(true);
					return;
				}
				Alert.alert(
					"OTP Sent",
					"A new verification code has been sent via SMS.",
				);
			} else if (claimStore.selectedProfile) {
				await sendOTP(claimStore.selectedProfile.id, null);
				Alert.alert(
					"OTP Sent",
					"A new verification code has been sent to your email.",
				);
			} else {
				if (!pendingSignUp?.email) {
					console.error(
						"[v0] OTP verification error: no email found",
					);
					return;
				}
				await sendOTP(null, pendingSignUp.email);
				Alert.alert(
					"OTP Sent",
					"A new verification code has been sent to your email.",
				);
			}

			setResendCount((c) => c + 1);
		} catch (error) {
			console.error("[v0] Resend OTP error:", error);
			Alert.alert("Error", "Failed to resend OTP. Please try again.");
		}
	};

	const otpString = otp.join("");

	/** Masked identifier shown under the title */
	const maskedTarget = isSmsChannel
		? claimStore.selectedProfile?.phone
		: (claimStore.selectedProfile?.email ?? pendingSignUp?.email);

	return (
		<KeyboardAwareScrollView
			enableOnAndroid={true}
			extraScrollHeight={5}
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<SharedBody>
				<View className="flex-1 px-6 py-8">
					{/* Content */}
					<View className="flex-1 justify-center items-center px-4">
						{/* Channel icon */}
						<View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
							{isSmsChannel ? (
								<MessageSquare
									size={40}
									color={Colors.primary[700]}
								/>
							) : (
								<Mail size={40} color={Colors.primary[700]} />
							)}
						</View>
						{/* Title */}
						<Text className="text-2xl font-bold text-text text-center mb-2">
							Enter Verification Code
						</Text>

						{/* Description */}
						<Text className="font-regular text-center text-gray-700 mb-1">
							{isSmsChannel
								? "We sent a 6-digit code via SMS to"
								: "We sent a 6-digit verification code to"}
						</Text>
						<Text className="font-semibold text-text mb-8">
							{maskedTarget}
						</Text>
						<Text className="font-regular text-center text-gray-700 mb-4">
							Please enter the code below:
						</Text>

						<View className="w-full flex-row justify-between items-center self-center gap-2 mb-8">
							{otp.map((digit, index) => (
								<TextInput
									key={index}
									ref={(ref) => {
										inputRefs.current[index] = ref;
									}}
									className="flex-1 border border-border bg-card rounded-[15px] text-center text-md font-semibold text-text"
									style={{
										paddingVertical:
											Platform.OS === "android" ? 12 : 18,
									}}
									value={digit}
									onChangeText={(value) =>
										handleOtpChange(value, index)
									}
									onKeyPress={({ nativeEvent }) =>
										handleKeyPress(nativeEvent.key, index)
									}
									keyboardType="number-pad"
									maxLength={index === 0 ? 6 : 1}
									textContentType={
										index === 0 ? "oneTimeCode" : "none"
									}
									autoComplete={
										index === 0 ? "sms-otp" : "off"
									}
									importantForAutofill={
										index === 0 ? "yes" : "no"
									}
									selectTextOnFocus
									autoFocus={index === 0}
								/>
							))}
						</View>

						{/* Verify Button */}
						<TouchableOpacity
							className={`w-full py-4 rounded-[15px] items-center justify-center  bg-primary-600`}
							onPress={handleVerifyOTP}
							disabled={otpString.length !== 6 || isLoading}
						>
							{isLoading ? (
								<ActivityIndicator color="white" />
							) : (
								<Text className="text-lg text-white font-bold">
									Verify Code
								</Text>
							)}
						</TouchableOpacity>

						{/* Resend Section */}
						<View className="items-center mt-6">
							<Text className="font-regular text-sm text-gray-700 mb-2">
								Didn&apos;t receive the code?
							</Text>

							{resendCount >= MAX_RESENDS ? (
								// Hard cap hit — direct to admin
								<View className="items-center px-4">
									<Text className="text-muted-foreground text-sm text-center">
										Too many attempts. Please contact your
										cell leader or an administrator for
										assistance.
									</Text>
								</View>
							) : canResend ? (
								<TouchableOpacity
									onPress={handleResendOTP}
									className="flex-row items-center"
								>
									<Text className="text-blue-500 font-semibold ml-2">
										Send Again
										{isSmsChannel && resendCount > 0
											? ` (${MAX_RESENDS - resendCount} left)`
											: ""}
									</Text>
								</TouchableOpacity>
							) : (
								<Text className=" text-sm text-gray-700">
									Resend in {resendTimer}s
									{isSmsChannel && resendCount > 0
										? ` · ${MAX_RESENDS - resendCount} attempt${MAX_RESENDS - resendCount !== 1 ? "s" : ""} left`
										: ""}
								</Text>
							)}
						</View>
					</View>
				</View>
			</SharedBody>
		</KeyboardAwareScrollView>
	);
};

export default Page;
