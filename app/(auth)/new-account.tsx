import PulsingLogo from "@/components/shared/PulsingLogo";
import { inputPadding } from "@/constants/const_styles";
import { useClaimStore } from "@/stores/claimStore";
import { useSignUpStore } from "@/stores/signUpStore";
import {
	createUserWithEmailAndPassword,
	getAuth,
} from "@react-native-firebase/auth";
import { Link, useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

type PasswordFormData = {
	password: string;
};

const Page = () => {
	const router = useRouter();
	const claimToken = useClaimStore((state) => state.claimToken);
	const setSelectedProfile = useClaimStore((state) => state.setSelectedProfile);
	const { pendingSignUp, setPendingSignUp } = useSignUpStore();
	const email = pendingSignUp?.email?.trim() ?? "";
	const [showPassword, setShowPassword] = useState(false);
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<PasswordFormData>({
		defaultValues: { password: "" },
	});

	useEffect(() => {
		if (!claimToken || !email) {
			router.replace("/(auth)/sign-up");
		}
	}, [claimToken, email, router]);

	const onSubmit = async (data: PasswordFormData) => {
		const password = data.password.trim();
		if (!email || !password) {
			Alert.alert("Error", "Email and password are required.");
			return;
		}

		try {
			setSelectedProfile(null);
			await createUserWithEmailAndPassword(getAuth(), email, password);
			setPendingSignUp({ email, password: "" });
			router.replace("/(auth)/complete-profile");
		} catch (err: any) {
			if (err.code === "auth/email-already-in-use") {
				Alert.alert(
					"Email Already In Use",
					"The email is already in use by another account. Try logging in instead.",
					[
						{ text: "Cancel", style: "cancel" },
						{
							text: "Sign In",
							onPress: () => router.replace("/sign-in"),
						},
					],
				);
				return;
			}
			Alert.alert("Error", err.message || "Failed to create account.");
		}
	};

	if (!claimToken || !email) {
		return null;
	}

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
					Your email is verified. Choose a password to finish creating
					your account.
				</Text>

				<View className="gap-y-6">
					<View className="ml-[-2px]">
						<Text className="font-semibold text-gray-700 ml-1 mb-2">
							Verified Email
						</Text>
						<View className="flex-row items-center bg-white border border-border rounded-[15px] px-4">
							<Mail size={20} color="#6b7280" />
							<Text
								className="font-regular flex-1 ml-3 text-gray-400"
								style={inputPadding}
							>
								{email}
							</Text>
						</View>
					</View>

					<View className="ml-[-2px]">
						<Text className="font-semibold text-gray-700 ml-1 mb-2">
							Password
						</Text>
						<Controller
							control={control}
							name="password"
							rules={{
								required: "Password is required",
								minLength: {
									value: 6,
									message:
										"Password must be at least 6 characters",
								},
							}}
							render={({ field: { onChange, onBlur, value } }) => (
								<View className="flex-row items-center bg-white border border-border rounded-[15px] px-4">
									<Lock size={20} color="#6b7280" />
									<TextInput
										className="font-regular flex-1 ml-3 text-gray-600"
										style={inputPadding}
										placeholder="Enter your password"
										placeholderTextColor="#9ca3af"
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										secureTextEntry={!showPassword}
										autoCapitalize="none"
										autoComplete="password-new"
										returnKeyType="done"
										onSubmitEditing={handleSubmit(onSubmit)}
									/>
									<TouchableOpacity
										onPress={() =>
											setShowPassword(!showPassword)
										}
										accessibilityRole="button"
										accessibilityLabel={
											showPassword
												? "Hide password"
												: "Show password"
										}
									>
										{showPassword ? (
											<Eye size={20} color="#9ca3af" />
										) : (
											<EyeOff size={20} color="#9ca3af" />
										)}
									</TouchableOpacity>
								</View>
							)}
						/>
						{errors.password && (
							<Text className="text-primary-500 text-sm ml-1 mt-2">
								{errors.password.message}
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
								Create Account
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
