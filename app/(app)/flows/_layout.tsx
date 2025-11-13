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
					title: "Flows",
					headerShown: true,
					header() {
						return <SharedHeader title="Flows" />;
					},
				}}
			/>
			{/* <Stack.Screen
				name="[category]"
				options={({ route }) => ({
					title: "Resource",
					headerShown: true,
					header() {
						return (
							<SharedHeader
								title={(route.params as any).category}
								isPop
							/>
						);
					},
				})}
			/> */}
		</Stack>
	);
}
