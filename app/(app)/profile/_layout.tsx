import SharedHeader from "@/components/shared/SharedHeader";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

export default function ProfileLayout() {
	const { backPath } = useLocalSearchParams<{ backPath?: string }>();
	const router = useRouter();
	return (
		<Stack>
			<Stack.Screen
				name="[id]"
				options={{
					headerShown: true,
					header() {
						return (
							<SharedHeader
								title="Profile"
								isPop
								backFunc={() => {
									console.log(
										"Back function called with backPath:",
										backPath,
									);
									backPath
										? router.replace(backPath as any)
										: router.back();
								}}
							/>
						);
					},
				}}
			/>
		</Stack>
	);
}
