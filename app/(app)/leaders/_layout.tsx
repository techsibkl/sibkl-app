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
		</Stack>
	);
}
