import { useAuthStore } from "@/stores/authStore";
import { Link } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	ImageSourcePropType,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import PulsingLogo from "@/components/shared/PulsingLogo";
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
			// navigate to your home screen if needed
		} catch (error: any) {
			setError("password", { type: "manual", message: error });
			setIsLoading(false);
		}
	};

	const toggleRememberMe = (): void => {
		const currentValue = watch("rememberMe");
		setValue("rememberMe", !currentValue);
	};

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-transparent"
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView
				className="bg-red-700"
				contentContainerStyle={{
					flexGrow: 1,
				}}
				keyboardShouldPersistTaps="handled"
			>
				<View className="items-center justify-center mt-16 py-[7rem]">
					<PulsingLogo
						source={SibklText as ImageSourcePropType}
						className="h-18"
					/>
				</View>
				<View className="bg-background py-10 px-6 rounded-t-[30px] h-full">
					<Text className="text-3xl font-bold text-gray-700 mb-2">
						Sign In
					</Text>
					<Text className="font-regular text-gray-700 mb-8">
						Welcome back! It's great to see you.
					</Text>
					{/* Sign in form */}
					<View className="gap-y-6">
						{/* Email input */}
						<View className="ml-[-2px]">
							<Text className="font-semibold text-gray-700 ml-1 mb-2">
								Email
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
												<Eye
													size={20}
													color="#9ca3af"
												/>
											) : (
												<EyeOff
													size={20}
													color="#9ca3af"
												/>
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
						<View className="flex-row items-center justify-between ">
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
							<Link href="/forgot-password" asChild>
								<TouchableOpacity>
									<Text className="text-sm text-blue-500 font-semibold">
										Forgot Password?
									</Text>
								</TouchableOpacity>
							</Link>
						</View>

						{/* Sign in button */}
						<TouchableOpacity
							className={`w-full py-4 rounded-[15px] items-center justify-center mt-6 bg-primary-600`}
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
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default Page;
