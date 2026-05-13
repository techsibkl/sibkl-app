import { FormField } from "@/components/shared/FormField";
import SharedBody from "@/components/shared/SharedBody";
import { OtpChannel, sendOTP } from "@/services/OTP/otp.service";
import { useClaimStore } from "@/stores/claimStore";
import { useSignUpStore } from "@/stores/signUpStore";
import { useRouter } from "expo-router";
import { Mail, Smartphone } from "lucide-react-native";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Alert,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const Page = () => {
	type signUpFormData = {
		email: string;
		password: string;
	};
	const router = useRouter();
	const { selectedProfile } = useClaimStore();
	const signUpStore = useSignUpStore();
	const [isSmsLoading, setIsSmsLoading] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<signUpFormData>({
		defaultValues: { email: selectedProfile?.email ?? "", password: "" },
	});

	const sendAndNavigate = async (channel: OtpChannel, password: string) => {
		const result = await sendOTP(selectedProfile?.id!, null, channel);
		if (!result?.success) {
			throw new Error(result?.message || "Failed to send OTP.");
		}
		signUpStore.setOtpChannel(channel);
		signUpStore.setPendingSignUp({ email: "", password });
	};

	const onSubmit = async (data: signUpFormData) => {
		try {
			await sendAndNavigate("email", data.password);
			router.push("/(auth)/verify-otp");
		} catch (err: any) {
			Alert.alert("Error", err.message || "Failed to send verification code.");
		}
	};

	const onSubmitSms = async () => {
		setIsSmsLoading(true);
		try {
			await sendAndNavigate("sms", "");
			router.push("/(auth)/verify-otp");
		} catch (err: any) {
			Alert.alert("Error", err.message || "Failed to send SMS code.");
		} finally {
			setIsSmsLoading(false);
		}
	};

	const hasValidPhone = Boolean(selectedProfile?.phone?.trim());

	return (
		<SharedBody>
			<KeyboardAwareScrollView
				className="flex-1 bg-background p-6"
				enableOnAndroid={true}
				extraScrollHeight={5}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{
					flexGrow: 1,
				}}
			>
				<View className="gap-y-4">
					{selectedProfile && (
						<View>
							<Text className="text-sm italic text-text-secondary">
								*Is this you? You are attempting to claim this
								profile
							</Text>

							<Text className="font-semibold text-lg text-text">
								Full Name: {selectedProfile?.full_legal_name}
							</Text>

							<Text className="text-sm text-text-secondary">
								Phone: {selectedProfile?.phone}
							</Text>
							<Text className="text-sm text-text-secondary">
								Email: {selectedProfile?.email}
							</Text>
							<Text className="text-sm text-text-secondary">
								Extra info:{" "}
								{selectedProfile?.migrate_extra_info}
							</Text>
						</View>
					)}

					{/* Email */}
					<FormField
						name="email"
						label="Claim Email"
						control={control}
						errors={errors}
						disabled={selectedProfile ? true : false}
						icon={<Mail size={20} color="#6b7280" />}
					/>
				</View>

				{/* Submit */}
				<TouchableOpacity
					disabled={isSubmitting}
					onPress={handleSubmit(onSubmit)}
					className={`w-full py-4 rounded-[15px] items-center justify-center mt-6 bg-primary-600`}
				>
					{isSubmitting ? (
						<ActivityIndicator color="white" />
					) : (
						<Text className="text-lg text-white font-bold">
							Verify & Continue
						</Text>
					)}
				</TouchableOpacity>

				{/* SMS alternative — only shown when profile has a phone number */}
				{hasValidPhone && (
					<TouchableOpacity
						disabled={isSmsLoading || isSubmitting}
						onPress={onSubmitSms}
						className="flex-row items-center justify-center mt-4 gap-x-2"
					>
						{isSmsLoading ? (
							<ActivityIndicator size="small" color="#6b7280" />
						) : (
							<>
								<Smartphone size={16} color="#6b7280" />
								<Text className="text-sm text-text-secondary">
									Verify with phone number instead (
									{selectedProfile?.phone})
								</Text>
							</>
						)}
					</TouchableOpacity>
				)}
			</KeyboardAwareScrollView>
		</SharedBody>
	);
};

export default Page;
