import { FormField } from "@/components/shared/FormField";
import SharedBody from "@/components/shared/SharedBody";
import { sendOTP } from "@/services/OTP/otp.service";
import { useClaimStore } from "@/stores/claimStore";
import { useSignUpStore } from "@/stores/signUpStore";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
const Page = () => {
	type signUpFormData = {
		email: string;
		password: string;
	};
	const router = useRouter();
	const { selectedProfile } = useClaimStore();
	const signUpStore = useSignUpStore();
	const [showPassword, setShowPassword] = useState(false);
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
			selectedProfile?.email
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
			<ScrollView
				className="flex-1 px-6 py-8"
				showsVerticalScrollIndicator={false}
			>
				<Text className="text-2xl font-bold mb-6">
					Create New Account
				</Text>

				{/* <Text className="text-2xl font-bold mb-6">
          {JSON.stringify(selectedProfile)}
        </Text> */}

				{/* Email */}
				<FormField
					name="email"
					label="Email"
					control={control}
					errors={errors}
					disabled={selectedProfile ? false : true}
				/>

				{/* Password */}
				<FormField
					control={control}
					label="Password"
					name="password"
					rules={{ required: "Password is required", minLength: 6 }}
					errors={errors}
					secureTextEntry={!showPassword}
					rightIcon={
						<TouchableOpacity
							onPress={() => setShowPassword(!showPassword)}
						>
							{showPassword ? (
								<EyeOff size={20} color="#9ca3af" />
							) : (
								<Eye size={20} color="#9ca3af" />
							)}
						</TouchableOpacity>
					}
				/>

				{selectedProfile && (
					<View>
						<Text className="text-sm text-text-secondary">
							*You can change the information below later
						</Text>

						<Text className="font-semibold text-lg text-text">
							Full Name: {selectedProfile?.full_name}
						</Text>

						<Text className="text-sm text-text-secondary">
							Phone: {selectedProfile?.phone}
						</Text>
					</View>
				)}

				{/* Submit */}
				<TouchableOpacity
					disabled={isSubmitting}
					onPress={handleSubmit(onSubmit)}
					className="bg-primary-600 rounded-[15px] py-3 mt-4 items-center"
				>
					<Text className="text-white font-semibold text-base">
						{isSubmitting ? "Creating..." : "Create Account"}
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</SharedBody>
	);
};

export default Page;
