import SharedHeader from "@/components/shared/SharedHeader";
import { useAuthStore } from "@/stores/authStore";
import { Stack } from "expo-router";
import React from "react";
import { Alert } from "react-native";

export default function AuthLayout() {
	const { signOut } = useAuthStore();

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="sign-in" />
			<Stack.Screen name="sign-up" />
			<Stack.Screen name="new-account" />
			<Stack.Screen name="claim-set-password" />
			<Stack.Screen
				name="complete-profile"
				options={{
					headerShown: true,
					header() {
						return (
							<SharedHeader
								title="Complete Profile"
								backFunc={() => {
									Alert.alert(
										"Are you sure you want to go back?",
										"Your progress will be lost.",
										[
											{ text: "Cancel", style: "cancel" },
											{
												text: "Yes, back to login",
												style: "destructive",
												onPress: async () => {
													await signOut();
													// router.replace("/(auth)");
												},
											},
										],
									);
								}}
							/>
						);
					},
				}}
			/>
			<Stack.Screen
				name="forgot-password"
				options={{
					headerShown: true,
					header() {
						return <SharedHeader title="Forgot Password" />;
					},
				}}
			/>
			<Stack.Screen
				name="selected-account"
				options={{
					headerShown: true,
					header() {
						return <SharedHeader title="Verify Ownership" isPop />;
					},
				}}
			/>
			<Stack.Screen
				name="verify-otp"
				options={{
					headerShown: true,
					header() {
						return <SharedHeader title="Verify Email" isPop />;
					},
				}}
			/>
		</Stack>
	);
}
