import PulsingLogo from "@/components/shared/PulsingLogo";
import { inputPadding } from "@/constants/const_styles";
import {
	EMAIL_ALREADY_REGISTERED,
	sendEmailOTP,
} from "@/services/OTP/otp.service";
import { useClaimStore } from "@/stores/claimStore";
import { useSignUpStore } from "@/stores/signUpStore";
import { Link, useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Alert,
	ImageSourcePropType,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SibklText from "../../assets/images/sibkl-text-white.png";

type EmailFormData = {
	email: string;
};

const Page = () => {
	const router = useRouter();
	const claimStore = useClaimStore();
	const signUpStore = useSignUpStore();
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<EmailFormData>({
		defaultValues: { email: "" },
	});

	const showEmailTaken = () => {
		Alert.alert(
			"Account already exists",
			"An account with this email already exists.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Forgot Password",
					onPress: () => router.push("/forgot-password"),
				},
				{
					text: "Sign In",
					onPress: () => router.replace("/sign-in"),
				},
			],
		);
	};

	const onSubmit = async (data: EmailFormData) => {
		const email = data.email.trim();
		try {
			const result = await sendEmailOTP(null, email);
			if (result.err_code === EMAIL_ALREADY_REGISTERED) {
				showEmailTaken();
				return;
			}
			if (!result.success) {
				Alert.alert(
					"Error",
					result.message || "Failed to send verification code.",
				);
				return;
			}

			claimStore.reset();
			signUpStore.setPendingSignUp({ email, password: "" });
			router.push("/(auth)/verify-otp");
		} catch (err: any) {
			Alert.alert(
				"Error",
				err.message || "Failed to send verification code.",
			);
		}
	};

	return (
		<KeyboardAwareScrollView
			className="flex-1 bg-red-700"
			enableOnAndroid={true}
			extraScrollHeight={5}
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<View className="items-center justify-center mt-16 py-[7rem]">
				<PulsingLogo
					source={SibklText as ImageSourcePropType}
					className="h-18"
				/>
			</View>
			<View className="bg-background py-10 px-6 rounded-t-[30px] h-full">
				<Text className="text-3xl font-bold text-gray-700 mb-2">
					Create Account
				</Text>
				<Text className="font-regular text-gray-700 mb-8">
					Enter your email. We&apos;ll verify it before looking for an
					existing profile.
				</Text>

				<View className="gap-y-6">
					<View className="ml-[-2px]">
						<Text className="font-semibold text-gray-700 ml-1 mb-2">
							Email
						</Text>
						<Controller
							control={control}
							name="email"
							rules={{
								required: "Email is required",
								pattern: {
									value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
									message: "Enter a valid email address",
								},
							}}
							render={({ field: { onChange, onBlur, value } }) => (
								<View className="flex-row items-center bg-white border border-border rounded-[15px] px-4">
									<Mail size={20} color="#6b7280" />
									<TextInput
										className="font-regular flex-1 ml-3 text-gray-600"
										style={inputPadding}
										placeholder="Enter your email"
										placeholderTextColor="#9ca3af"
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										keyboardType="email-address"
										autoCapitalize="none"
										autoComplete="email"
										autoCorrect={false}
										returnKeyType="done"
										onSubmitEditing={handleSubmit(onSubmit)}
									/>
								</View>
							)}
						/>
						{errors.email && (
							<Text className="text-primary-500 text-sm ml-1 mt-2">
								{errors.email.message}
							</Text>
						)}
					</View>

					<TouchableOpacity
						className="w-full py-4 rounded-[15px] items-center justify-center mt-6 bg-primary-600"
						onPress={handleSubmit(onSubmit)}
						disabled={isSubmitting}
						accessibilityRole="button"
					>
						{isSubmitting ? (
							<ActivityIndicator color="white" />
						) : (
							<Text className="text-lg text-white font-bold">
								Continue
							</Text>
						)}
					</TouchableOpacity>

					<View className="items-center">
						<Text className="font-regular text-gray-600 text-sm">
							Already have an account?{" "}
							<Link href="/sign-in" asChild>
								<Text className="text-primary-600 font-semibold">
									Sign In
								</Text>
							</Link>
						</Text>
					</View>
				</View>
			</View>
		</KeyboardAwareScrollView>
	);
};

export default Page;
