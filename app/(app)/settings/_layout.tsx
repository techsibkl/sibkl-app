import SharedHeader from "@/components/shared/SharedHeader";
import { Stack } from "expo-router";

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
						return <SharedHeader title="Settings" />;
					},
				}}
			/>
		</Stack>
	);
}
