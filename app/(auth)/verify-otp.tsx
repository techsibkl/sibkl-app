import SharedBody from "@/components/shared/SharedBody";
import { sendOTP, verifyOTP } from "@/services/OTP/otp.service";
import { fetchPeople } from "@/services/Person/person.service";
import { useAuthStore } from "@/stores/authStore";
import { useClaimStore } from "@/stores/claimStore";
import { useSignUpStore } from "@/stores/signUpStore";
import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import {
	createUserWithEmailAndPassword,
	getAuth,
} from "@react-native-firebase/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Mail, RefreshCw } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
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
	const authStore = useAuthStore();
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const [isLoading, setIsLoading] = useState(false);
	const [resendTimer, setResendTimer] = useState(30);
	const [canResend, setCanResend] = useState(false);
	const qc = useQueryClient();

	const inputRefs = useRef<(TextInput | null)[]>([]);

	// Resend timer countdown
	useEffect(() => {
		if (resendTimer > 0) {
			const timer = setTimeout(
				() => setResendTimer(resendTimer - 1),
				1000
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
		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		// Auto-focus next input
		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyPress = (key: string, index: number) => {
		if (key === "Backspace" && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const fetchClaimedPerson = async (personId: number) => {
		const res = await secureFetch(
			apiEndpoints.users.createUserWithExistingPerson,
			{
				method: "POST",
				body: JSON.stringify({
					people_id: personId,
				}),
			}
		);
		const json = await res.json();
		if (json.success) {
			// Call react query here
			await qc.prefetchQuery({
				queryKey: ["person", personId],
				queryFn: () => fetchPeople(claimStore.selectedProfile?.id),
			});
			router.push("/(auth)/complete-profile");
			return;
		}
	};

	const handleVerifyOTP = async () => {
		const otpString = otp.join("");
		if (otpString.length !== 6) {
			Alert.alert("Invalid OTP", "Please enter a 6-digit code");
			return;
		}
		console.log("Verifying OTP:", otpString);
		setIsLoading(true);

		try {
			// If claimed selectedProfile, use its ID
			const personId = claimStore.selectedProfile?.id || null;
			const email = pendingSignUp?.email || null;
			const result = await verifyOTP(personId, email, otpString);

			if (result.success) {
				// create firebase account
				const resEmail = result.data?.email.trim();

				const { user } = await createUserWithEmailAndPassword(
					getAuth(),
					resEmail,
					pendingSignUp?.password!
				);

				// get full person if selectedProfile is true
				console.log("Selected profile", claimStore.selectedProfile);
				if (claimStore.selectedProfile) {
					await fetchClaimedPerson(claimStore.selectedProfile.id);
					return;
				} else {
					router.push("/(auth)/complete-profile");
				}
			} else {
				Alert.alert(
					"Invalid OTP",
					"The code you entered is incorrect. Please try again."
				);
				setOtp(["", "", "", "", "", ""]);
				inputRefs.current[0]?.focus();
			}
		} catch (error) {
			console.error("OTP verification error:", error);
			Alert.alert("Error", "Failed to verify OTP. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendOTP = async () => {
		if (!canResend) return;

		try {
			// TODO: Implement resend OTP API call
			console.log("[v0] Resending OTP to:", pendingSignUp?.email);

			// Simulate API call
			setResendTimer(30);
			setCanResend(false);

			if (claimStore.selectedProfile) {
				await sendOTP(claimStore.selectedProfile.id, null);
			} else {
				if (!pendingSignUp || !pendingSignUp.email) {
					console.error(
						"[v0] OTP verification error:",
						"no email found"
					);
					return;
				}
				await sendOTP(null, pendingSignUp.email);
			}
			Alert.alert(
				"OTP Sent",
				"A new verification code has been sent to your email."
			);
		} catch (error) {
			console.error("[v0] Resend OTP error:", error);
			Alert.alert("Error", "Failed to resend OTP. Please try again.");
		}
	};

	const otpString = otp.join("");

	return (
		<KeyboardAwareScrollView
			enableOnAndroid={true}
			extraScrollHeight={10} // 👈 pushes inputs above keyboard
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<SharedBody>
				<View className="flex-1 px-6 py-8">
					{/* Header with back button */}
					<View className="flex-row items-center ">
						{/* <TouchableOpacity onPress={onBack} className="mr-4">
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity> */}
						<Text className="text-lg font-semibold text-text">
							Verify Email
						</Text>
					</View>

					{/* Content */}
					<View className="flex-1 justify-center items-center px-4">
						{/* Email icon */}
						<View className="w-20 h-20 bg-primary-50 rounded-full items-center justify-center mb-6">
							<Mail size={40} color="#AC2212" />
						</View>

						{/* Title */}
						<Text className="text-2xl font-bold text-text text-center mb-4">
							Enter Verification Code
						</Text>

						{/* Description */}
						<Text className="text-muted-foreground text-center mb-8 leading-relaxed">
							We sent a 6-digit verification code to{"\n"}
							<Text className="font-semibold text-text">
								{claimStore.selectedProfile?.email ||
									pendingSignUp?.email}
							</Text>
							{"\n"}Please enter the code below
						</Text>

						<View className="flex-row justify-center items-center gap-2 mb-8">
							{otp.map((digit, index) => (
								<TextInput
									key={index}
									ref={(ref) =>
										(inputRefs.current[index] = ref)
									}
									className="px-5 py-2 border border-border bg-card rounded-[15px] text-center text-lg font-semibold text-text"
									value={digit}
									onChangeText={(value) =>
										handleOtpChange(value.slice(-1), index)
									}
									onKeyPress={({ nativeEvent }) =>
										handleKeyPress(nativeEvent.key, index)
									}
									keyboardType="numeric"
									maxLength={1}
									selectTextOnFocus
									autoFocus={index === 0}
								/>
							))}
						</View>

						{/* Verify Button */}
						<TouchableOpacity
							onPress={handleVerifyOTP}
							disabled={otpString.length !== 6 || isLoading}
							className={`w-full h-12 rounded-[15px] items-center justify-center mb-6 ${
								otpString.length !== 6 || isLoading
									? "bg-muted"
									: "bg-primary-600"
							}`}
						>
							{isLoading ? (
								<ActivityIndicator color="white" />
							) : (
								<Text
									className={`font-semibold ${otpString.length !== 6 ? "text-muted-foreground" : "text-white"}`}
								>
									Verify Code
								</Text>
							)}
						</TouchableOpacity>

						{/* Resend Section */}
						<View className="items-center">
							<Text className="text-muted-foreground text-sm mb-2">
								Didn`&apos;t receive the code?
							</Text>

							{canResend ? (
								<TouchableOpacity
									onPress={handleResendOTP}
									className="flex-row items-center"
								>
									<RefreshCw size={16} color="#AC2212" />
									<Text className="text-primary-600 font-semibold ml-2">
										Send Again
									</Text>
								</TouchableOpacity>
							) : (
								<Text className="text-muted-foreground text-sm">
									Resend in {resendTimer}s
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
