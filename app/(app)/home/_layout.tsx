import Greeting from "@/components/Home/Greeting";
import SharedHeader from "@/components/shared/SharedHeader";
import { Stack } from "expo-router";
import React from "react";

export const unstable_settings = {
	initialRouteName: "index",
};

export default function Layout() {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					header() {
						return <SharedHeader child={<Greeting />} />;
					},
				}}
			/>
			<Stack.Screen
				name="profile/index"
				options={({ route }) => ({
					headerShown: true,
					header() {
						return <SharedHeader title="My Profile" isPop />;
					},
				})}
			/>
			<Stack.Screen
				name="profile/updateProfile/index"
				options={({ route }) => ({
					headerShown: true,
					header() {
						return <SharedHeader title="My Profile" isPop />;
					},
				})}
			/>
		</Stack>
	);
}
