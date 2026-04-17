import { getAuth, sendPasswordResetEmail } from "@react-native-firebase/auth";
import { router, useLocalSearchParams } from "expo-router";
import { Mail } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import { openInbox } from "react-native-email-link";

interface ForgotPasswordFormData {
	email: string;
}

const Page = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [sent, setSent] = useState(false);

	const { email: prefillEmail } = useLocalSearchParams<{ email: string }>();

	const {
		control,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<ForgotPasswordFormData>({
		defaultValues: { email: prefillEmail ?? "" },
	});

	const inputPadding =
		Platform.OS === "android"
			? { paddingVertical: 12 }
			: { paddingVertical: 18 };

	const onSubmit = async (data: ForgotPasswordFormData) => {
		try {
			setIsLoading(true);
			await sendPasswordResetEmail(getAuth(), data.email);
			setSent(true);
		} catch (error: any) {
			console.error("Error sending password reset email:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View className="bg-background flex-1 px-4 gap-y-5">
			{sent ? (
				<View className="items-center gap-y-4 py-8">
					<View className="bg-red-50 rounded-full p-10">
						<Mail size={120} color="#dc2626" />
					</View>
					<Text className="text-gray-800 font-bold text-xl text-center">
						Check your inbox
					</Text>
					<Text className="text-gray-500 font-regular text-sm text-center px-4">
						We've sent a password reset link to your email.
					</Text>
					<TouchableOpacity
						className="w-full rounded-[15px] items-center justify-center mt-2 bg-red-600"
						style={{
							paddingVertical:
								Platform.OS === "android" ? 14 : 16,
						}}
						onPress={() => openInbox()}
					>
						<Text className="text-lg text-white font-bold">
							Open Mail App
						</Text>
					</TouchableOpacity>
				</View>
			) : (
				<>
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
										returnKeyType="done"
									/>
								</View>
							)}
							name="email"
						/>
						{errors.email && (
							<Text className="text-primary-500 text-sm ml-1 mt-2">
								{errors?.email?.message}
							</Text>
						)}
					</View>

					{/* Send reset button */}
					<TouchableOpacity
						className="w-full rounded-[15px] items-center justify-center mt-2 bg-red-600"
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
								Send reset email
							</Text>
						)}
					</TouchableOpacity>
				</>
			)}

			{/* Back to login */}
			<View className="items-center">
				<TouchableOpacity onPress={() => router.back()}>
					<Text className="text-sm text-blue-500 font-semibold">
						Back to login
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default Page;
