import { FormField } from "@/components/shared/FormField";
import SharedBody from "@/components/shared/SharedBody";
import { sendOTP } from "@/services/OTP/otp.service";
import { useClaimStore } from "@/stores/claimStore";
import { useSignUpStore } from "@/stores/signUpStore";
import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import React from "react";
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
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<signUpFormData>({
		defaultValues: { email: selectedProfile?.email ?? "", password: "" },
	});

	const signUp = async (password: string) => {
		console.log(
			"sneding verification email for this email:",
			selectedProfile?.email,
		);
		// 1. Send OTP

		const result = await sendOTP(selectedProfile?.id!, null);
		console.log("result of sending OTP:", result.message);

		signUpStore.setPendingSignUp({ email: "", password });
	};

	const onSubmit = async (data: signUpFormData) => {
		try {
			await signUp(data.password);
			// Navigate to OTP verification page
			router.push("/(auth)/verify-otp");
		} catch (err: any) {
			Alert.alert("Error", err.message || "Failed to create account.");
		}
	};

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
			</KeyboardAwareScrollView>
		</SharedBody>
	);
};

export default Page;
