import { useAuthStore } from "@/stores/authStore";
import { Link, router } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	ImageSourcePropType,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import PulsingLogo from "@/components/shared/PulsingLogo";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SibklText from "../../assets/images/sibkl-text-white.png";

interface LoginFormData {
	email: string;
	password: string;
	rememberMe: boolean;
}

const Page = () => {
	const { signIn } = useAuthStore();

	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const passwordRef = useRef<TextInput>(null);

	const {
		control,
		handleSubmit,
		formState: { errors },
		setValue,
		setError,
		watch,
	} = useForm<LoginFormData>({
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false,
		},
	});

	const onSubmit = async (data: LoginFormData): Promise<void> => {
		try {
			setIsLoading(true);
			await signIn(data.email, data.password);
			setIsLoading(false);
		} catch (error: any) {
			setError("password", { type: "manual", message: error });
			setIsLoading(false);
		}
	};

	const toggleRememberMe = (): void => {
		const currentValue = watch("rememberMe");
		setValue("rememberMe", !currentValue);
	};

	// Android TextInput ignores padding from className — use style prop directly
	const inputPadding =
		Platform.OS === "android"
			? { paddingVertical: 12 }
			: { paddingVertical: 18 };

	return (
		<KeyboardAwareScrollView
			className="flex-1 bg-red-700"
			enableOnAndroid={true}
			extraScrollHeight={5}
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			{/* Logo section — smaller top padding on Android */}
			<View
				className="items-center justify-center my-16"
				style={{
					paddingTop: Platform.OS === "android" ? 48 : 64,
					paddingBottom: Platform.OS === "android" ? 32 : 48,
				}}
			>
				<PulsingLogo
					source={SibklText as ImageSourcePropType}
					className="h-18"
				/>
			</View>

			<View className="bg-background py-8 px-6 rounded-t-[30px] flex-1">
				<Text className="text-3xl font-bold text-gray-700 mb-2">
					Sign In
				</Text>
				<Text className="font-regular text-gray-700 mb-6">
					Welcome back! It's great to see you.
				</Text>

				<View className="gap-y-5">
					{/* Email input */}
					<View className="ml-[-2px]">
						<Text className="font-semibold text-gray-700 ml-1 mb-2">
							Email
						</Text>
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
										className="font-regular flex-1 ml-3"
										style={inputPadding}
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
										className="font-regular flex-1 ml-3"
										style={inputPadding}
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

					{/* Remember me and forgot password */}
					<View className="flex-row items-center justify-between">
						<Controller
							control={control}
							render={({ field: { value } }) => (
								<TouchableOpacity
									className="flex-row items-center"
									onPress={toggleRememberMe}
									activeOpacity={1}
								>
									<View
										className={`w-5 h-5 border-2 rounded mr-2 items-center justify-center ${
											value
												? "bg-blue-600 border-blue-600"
												: "border-gray-300"
										}`}
									>
										{value && (
											<Text className="text-white text-xs">
												✓
											</Text>
										)}
									</View>
									<Text className="font-regular text-sm text-gray-600">
										Remember me
									</Text>
								</TouchableOpacity>
							)}
							name="rememberMe"
						/>
						<TouchableOpacity
							onPress={() =>
								router.push({
									pathname: "/forgot-password",
									params: { email: watch("email") },
								})
							}
						>
							<Text className="text-sm text-blue-500 font-semibold">
								Forgot Password?
							</Text>
						</TouchableOpacity>
					</View>

					{/* Sign in button */}
					<TouchableOpacity
						className="w-full rounded-[15px] items-center justify-center mt-4 bg-primary-600"
						style={{
							paddingVertical:
								Platform.OS === "android" ? 14 : 16,
						}}
						onPress={handleSubmit(onSubmit)}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator color="white" />
						) : (
							<Text className="text-lg text-white font-bold">
								Sign In
							</Text>
						)}
					</TouchableOpacity>

					{/* Sign up link */}
					<View className="items-center">
						<Text className="font-regular text-gray-600 text-sm">
							Dont have an account?{" "}
							<Link href="/sign-up" asChild>
								<Text className="text-primary-600 font-semibold">
									Create Account
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
