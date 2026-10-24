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
					title: "Leaders",
					headerShown: true,
					header() {
						return <SharedHeader title="Leader's Page" />;
					},
				}}
			/>
			<Stack.Screen
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
			/>
			<Stack.Screen
				name="player"
				options={({ route }) => ({
					title: "Video",
					headerShown: true,
					header() {
						const title =
							(route.params as { title?: string })?.title ||
							"Video";
						return <SharedHeader title={title} isPop />;
					},
				})}
			/>
		</Stack>
	);
}
