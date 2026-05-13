import SharedBody from "@/components/shared/SharedBody";
import { Colors } from "@/constants/Colors";
import { deleteAccount } from "@/services/Auth/auth.service";
import { useAuthStore } from "@/stores/authStore";
import {
	deleteUser,
	getAuth,
	signInWithEmailAndPassword,
} from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import { AlertTriangle, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Alert,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type DeleteAccountFormData = {
	email: string;
	password: string;
};

export default function DeleteAccountScreen() {
	const router = useRouter();
	const { signOut } = useAuthStore();
	const auth = getAuth();
	const [step, setStep] = useState<"confirm" | "login" | "final">("confirm");
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const passwordRef = useRef<TextInput>(null);

	const inputPadding =
		Platform.OS === "android"
			? { paddingVertical: 12 }
			: { paddingVertical: 18 };

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<DeleteAccountFormData>({
		defaultValues: { email: "", password: "" },
	});

	const handleConfirmDelete = () => {
		Alert.alert(
			"Delete Account",
			"This action cannot be undone. All your data will be permanently deleted. Are you sure?",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Continue",
					style: "destructive",
					onPress: () => setStep("login"),
				},
			],
		);
	};

	const onSubmit = async (data: DeleteAccountFormData) => {
		setIsLoading(true);
		try {
			// Re-authenticate user
			const userCredential = await signInWithEmailAndPassword(
				auth,
				data.email,
				data.password,
			);

			if (!userCredential.user) {
				Alert.alert(
					"Error",
					"Failed to authenticate. Please try again.",
				);
				return;
			}

			setStep("final");
		} catch (error: any) {
			console.error("[v0] Authentication error:", error);
			if (error.code === "auth/invalid-credential") {
				Alert.alert(
					"Invalid Credentials",
					"The email or password you entered is incorrect.",
				);
			} else if (error.code === "auth/user-not-found") {
				Alert.alert(
					"User Not Found",
					"No account found with this email address.",
				);
			} else {
				Alert.alert(
					"Error",
					"Failed to authenticate. Please try again.",
				);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleFinalDelete = async () => {
		Alert.alert(
			"Final Confirmation",
			"This is your last chance to cancel. Your account and all data will be permanently deleted.",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete Permanently",
					style: "destructive",
					onPress: async () => {
						setIsLoading(true);
						try {
							// Call backend to delete user from database and Firebase
							await deleteAccount();

							// Delete Firebase auth user locally
							const currentUser = auth.currentUser;
							if (currentUser) {
								await deleteUser(currentUser);
							}

							Alert.alert(
								"Success",
								"Your account has been deleted successfully.",
								[
									{
										text: "OK",
										onPress: async () => {
											await signOut();
											router.replace(
												"/(auth)/index" as any,
											);
										},
									},
								],
							);
						} catch (error: any) {
							console.error("[v0] Delete account error:", error);
							Alert.alert(
								"Error",
								error?.message ||
									"Failed to delete account. Please try again.",
							);
						} finally {
							setIsLoading(false);
						}
					},
				},
			],
		);
	};

	const currentUser = auth.currentUser;
	const userEmail = currentUser?.email;

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
				{step === "confirm" && (
					<View className="flex-1">
						{/* Warning Icon */}
						<View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mx-auto mb-6">
							<AlertTriangle
								size={40}
								color={Colors.primary[600]}
							/>
						</View>

						{/* Title */}
						<Text className="text-2xl font-bold text-text text-center mb-4">
							Delete Account
						</Text>

						{/* Warning Message */}
						<View className="bg-red-50 border border-red-200 rounded-[15px] p-4 mb-6">
							<Text className="text-sm text-red-800 font-semibold mb-2">
								Warning: This action cannot be undone
							</Text>
							<Text className="text-sm text-red-700">
								Deleting your account will permanently remove
								all your data, including:
							</Text>
							<Text className="text-sm text-red-700 mt-2">
								• Your profile and settings{"\n"}• All your
								notes and history
								{"\n"}• Your participation in flows{"\n"}• All
								personal information
							</Text>
						</View>

						{/* Confirmation Button */}
						<TouchableOpacity
							className="w-full py-4 rounded-[15px] items-center justify-center bg-red-600 mb-3"
							onPress={handleConfirmDelete}
						>
							<Text className="text-lg text-white font-bold">
								I Want to Delete My Account
							</Text>
						</TouchableOpacity>

						{/* Cancel Button */}
						<TouchableOpacity
							className="w-full py-4 rounded-[15px] items-center justify-center border border-border"
							onPress={() => router.back()}
						>
							<Text className="text-lg text-text font-semibold">
								Cancel
							</Text>
						</TouchableOpacity>
					</View>
				)}

				{step === "login" && (
					<View className="flex-1">
						{/* Lock Icon */}
						<View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mx-auto mb-6">
							<Lock size={40} color={Colors.primary[700]} />
						</View>

						{/* Title */}
						<Text className="text-2xl font-bold text-text text-center mb-2">
							Confirm Your Identity
						</Text>

						{/* Description */}
						<Text className="font-regular text-center mb-6 text-gray-600">
							Please sign in with your current credentials to
							confirm account deletion
						</Text>

						{/* Current Email Display */}
						{userEmail && (
							<View className="bg-card border border-border rounded-[15px] p-4 mb-6">
								<Text className="text-xs text-gray-500 mb-1">
									Your email
								</Text>
								<Text className="text-sm font-semibold text-text">
									{userEmail}
								</Text>
							</View>
						)}

						{/* Email Field */}
						<View className="ml-[-2px] mb-4">
							<Text className="font-semibold text-gray-700 ml-1 mb-2">
								Email Address
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

						{/* Password Field */}
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

						{/* Submit Button */}
						<TouchableOpacity
							disabled={isSubmitting || isLoading}
							onPress={handleSubmit(onSubmit)}
							className="w-full py-4 rounded-[15px] items-center justify-center mt-6 bg-primary-600"
						>
							{isSubmitting || isLoading ? (
								<ActivityIndicator color="white" />
							) : (
								<Text className="text-lg text-white font-bold">
									Verify & Continue
								</Text>
							)}
						</TouchableOpacity>

						{/* Back Button */}
						<TouchableOpacity
							className="w-full py-4 rounded-[15px] items-center justify-center mt-3 border border-border"
							onPress={() => setStep("confirm")}
						>
							<Text className="text-lg text-text font-semibold">
								Back
							</Text>
						</TouchableOpacity>
					</View>
				)}

				{step === "final" && (
					<View className="flex-1">
						{/* Warning Icon */}
						<View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mx-auto mb-6">
							<AlertTriangle
								size={40}
								color={Colors.primary[600]}
							/>
						</View>

						{/* Title */}
						<Text className="text-2xl font-bold text-text text-center mb-4">
							Final Confirmation
						</Text>

						{/* Message */}
						<Text className="text-center text-gray-600 mb-6 text-base leading-6">
							You are about to permanently delete your account.
							This action cannot be reversed and all your data
							will be lost forever.
						</Text>

						{/* Confirmation List */}
						<View className="bg-red-50 border border-red-200 rounded-[15px] p-4 mb-6">
							<Text className="text-sm font-semibold text-red-800 mb-3">
								This will delete:
							</Text>
							<Text className="text-sm text-red-700">
								✓ Your complete profile
							</Text>
							<Text className="text-sm text-red-700">
								✓ All personal data
							</Text>
							<Text className="text-sm text-red-700">
								✓ Your activity history
							</Text>
							<Text className="text-sm text-red-700">
								✓ All notes and records
							</Text>
						</View>

						{/* Delete Button */}
						<TouchableOpacity
							disabled={isLoading}
							className="w-full py-4 rounded-[15px] items-center justify-center bg-red-600 mb-3"
							onPress={handleFinalDelete}
						>
							{isLoading ? (
								<ActivityIndicator color="white" />
							) : (
								<Text className="text-lg text-white font-bold">
									Delete My Account Permanently
								</Text>
							)}
						</TouchableOpacity>

						{/* Cancel Button */}
						<TouchableOpacity
							disabled={isLoading}
							className="w-full py-4 rounded-[15px] items-center justify-center border border-border"
							onPress={() => router.back()}
						>
							<Text className="text-lg text-text font-semibold">
								Cancel
							</Text>
						</TouchableOpacity>
					</View>
				)}
			</KeyboardAwareScrollView>
		</SharedBody>
	);
}
