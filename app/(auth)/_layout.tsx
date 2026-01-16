import SharedHeader from "@/components/shared/SharedHeader";
import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="sign-in" />
			<Stack.Screen name="sign-up" />
			<Stack.Screen name="complete-profile" />
			<Stack.Screen name="forgot-password" />
			<Stack.Screen name="new-account" />
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
