import PulsingLogo from "@/components/shared/PulsingLogo";
import { sendOTP } from "@/services/OTP/otp.service";
import { useSignUpStore } from "@/stores/signUpStore";
import { Link, useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useRef, useState } from "react";
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

const Page = () => {
	type signUpFormData = {
		email: string;
		password: string;
	};

	const [showPassword, setShowPassword] = useState(false);
	const passwordRef = useRef<TextInput>(null);

	const router = useRouter();
	const signUpStore = useSignUpStore();
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<signUpFormData>({
		defaultValues: { email: "", password: "" },
	});

	// Create Account clicked -> send OTP and navigate to OTP verification page
	const onSubmit = async (data: signUpFormData) => {
		try {
			const email = data.email.trim();
			const password = data.password.trim();

			if (!email || !password) {
				Alert.alert("Error", "Email and password are required.");
				return;
			}
			await sendOTP(null, email);
			signUpStore.setPendingSignUp({ email, password });

			// Navigate to OTP verification page
			router.push("/(auth)/verify-otp");
		} catch (err: any) {
			Alert.alert(
				"Error",
				err.message || "Failed to send verification code."
			);
		}
	};

	return (
		<KeyboardAwareScrollView
			className="flex-1 bg-red-700"
			enableOnAndroid={true}
			extraScrollHeight={5}
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{
				flexGrow: 1,
			}}
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
					Let's get you started! Enter your email and password to
					create your account.
				</Text>

				<View className="gap-y-6">
					{/* Email input */}
					<View className="ml-[-2px]">
						<Text className="font-semibold text-gray-700 ml-1 mb-2">
							New Email
						</Text>
						<View className="">
							<Controller
								control={control}
								rules={{
									required: "Email is required",
									pattern: {
										value: /^\S+@\S+$/i,
										message: "Invalid email format",
									},
								}}
								render={({
									field: { onChange, onBlur, value },
								}) => (
									<View className="flex-row items-center bg-white border border-border rounded-[15px] px-4">
										<Mail size={20} color="#6b7280" />
										<TextInput
											className="font-regular flex-1 ml-3 py-5"
											placeholder="Enter your email"
											placeholderTextColor="#9ca3af"
											onBlur={onBlur}
											onChangeText={onChange}
											value={value}
											keyboardType="email-address"
											autoCapitalize="none"
											autoComplete="email"
											returnKeyType="next"
											onSubmitEditing={() =>
												passwordRef.current?.focus()
											}
										/>
									</View>
								)}
								name="email"
							/>
							{errors.email && (
								<Text className="text-primary-500 text-sm ml-1 mt-2">
									{errors.email.message}
								</Text>
							)}
						</View>
					</View>

					{/* Password input */}
					<View className="ml-[-2px]">
						<Text className="font-semibold text-gray-700 ml-1 mb-2">
							Password
						</Text>
						<Controller
							control={control}
							rules={{
								required: "Password is required",
								minLength: {
									value: 6,
									message:
										"Password must be at least 6 characters",
								},
							}}
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<View className="flex-row items-center bg-white border border-border rounded-[15px] px-4">
									<Lock size={20} color="#6b7280" />
									<TextInput
										ref={passwordRef}
										className="font-regular flex-1 ml-3 py-5"
										placeholder="Enter your password"
										placeholderTextColor="#9ca3af"
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										secureTextEntry={!showPassword}
										autoCapitalize="none"
										autoComplete="password"
										returnKeyType="done"
									/>
									<TouchableOpacity
										onPress={() =>
											setShowPassword(!showPassword)
										}
										activeOpacity={1}
									>
										{showPassword ? (
											<Eye size={20} color="#9ca3af" />
										) : (
											<EyeOff size={20} color="#9ca3af" />
										)}
									</TouchableOpacity>
								</View>
							)}
							name="password"
						/>

						{errors.password && (
							<Text className="text-primary-500 text-sm ml-1 mt-2">
								{errors.password.message}
							</Text>
						)}
					</View>

					{/* Submit */}
					<TouchableOpacity
						className={`w-full py-4 rounded-[15px] items-center justify-center mt-6 bg-primary-600`}
						onPress={handleSubmit(onSubmit)}
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<ActivityIndicator color="white" />
						) : (
							<Text className="text-lg text-white font-bold">
								Create Account
							</Text>
						)}
					</TouchableOpacity>

					{/* Sign in link */}
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
