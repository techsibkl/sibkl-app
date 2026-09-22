import SharedHeader from "@/components/shared/SharedHeader";
import { binaryFeatureFlags } from "@/config/featureFlags";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

export const unstable_settings = {
	initialRouteName: "index",
};

export default function Layout() {
	const { backPath } = useLocalSearchParams<{ backPath?: string }>();
	const router = useRouter();

	if (!binaryFeatureFlags.cells) {
		return <Redirect href="/(app)/home" />;
	}

	return (
		<Stack screenOptions={{ contentStyle: { flex: 1 } }}>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					header() {
						return <SharedHeader title="Cells" />;
					},
				}}
			/>
			<Stack.Screen
				name="profile/[id]"
				options={({ route }) => ({
					headerShown: true,
					header() {
						return (
							<SharedHeader
								title="Cell Info"
								isPop
								backFunc={() => {
									backPath
										? router.replace(backPath as any)
										: router.back();
								}}
							/>
						);
					},
				})}
			/>
			<Stack.Screen
				name="scanner"
				options={() => ({
					headerShown: false,
				})}
			/>
			<Stack.Screen
				name="qrScan"
				options={() => ({
					headerShown: false,
					tabBarStyle: { display: "none" },
					presentation: "fullScreenModal",
					contentStyle: { flex: 1, backgroundColor: "#000" },
				})}
			/>
			<Stack.Screen
				name="sessions/index"
				options={({ route }) => ({
					headerShown: true,
					header() {
						return <SharedHeader title="Sessions" isPop />;
					},
				})}
			/>
			<Stack.Screen
				name="sessions/[sessionId]"
				options={({ route }) => ({
					headerShown: true,
					header() {
						return <SharedHeader title="Session" isPop />;
					},
				})}
			/>
		</Stack>
	);
}
