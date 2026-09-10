import SharedHeader from "@/components/shared/SharedHeader";
import { featureFlags } from "@/config/featureFlags";
import { Redirect, Stack } from "expo-router";
import React from "react";

export const unstable_settings = {
	initialRouteName: "index",
};

export default function EventsLayout() {
	if (!featureFlags.events) {
		return <Redirect href="/(app)/home" />;
	}

	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					header() {
						return <SharedHeader title="Events" />;
					},
				}}
			/>
			<Stack.Screen
				name="[eventId]/index"
				options={{
					headerShown: true,
					header() {
						return <SharedHeader title="Event Details" isPop />;
					},
				}}
			/>
			<Stack.Screen
				name="[eventId]/register"
				options={{
					headerShown: true,
					header() {
						return <SharedHeader title="Register" isPop />;
					},
				}}
			/>
			<Stack.Screen
				name="[eventId]/confirmation"
				options={{
					headerShown: false,
					gestureEnabled: false,
				}}
			/>
			<Stack.Screen
				name="scanner"
				options={{
					headerShown: false,
					animation: "fade",
				}}
			/>
			<Stack.Screen
				name="qrScan"
				options={{
					headerShown: false,
					presentation: "fullScreenModal",
					contentStyle: { flex: 1, backgroundColor: "#000" },
				}}
			/>
		</Stack>
	);
}
