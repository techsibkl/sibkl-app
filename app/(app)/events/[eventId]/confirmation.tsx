import SharedBody from "@/components/shared/SharedBody";
import SharedButton from "@/components/shared/SharedButton";
import { useEventQuery } from "@/hooks/Event/useEventQuery";
import { useAuthStore } from "@/stores/authStore";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EventConfirmationScreen = () => {
	const { eventId } = useLocalSearchParams<{ eventId: string }>();
	const router = useRouter();
	const { isGuest } = useAuthStore();
	const { data: event } = useEventQuery(eventId);

	if (isGuest) {
		return <Redirect href="/(auth)/sign-in" />;
	}

	const handleDone = () => {
		router.replace("/(app)/events" as any);
	};

	return (
		<SharedBody>
			<SafeAreaView className="flex-1 px-6 justify-center items-center">
				<View className="items-center gap-4 w-full max-w-sm">
					<CheckCircle2 size={72} color="#22C55E" strokeWidth={1.5} />
					<Text className="text-2xl font-bold text-text text-center">
						You're registered!
					</Text>
					{event?.name ? (
						<Text className="text-base text-gray-600 text-center">
							Your registration for{" "}
							<Text className="font-semibold">{event.name}</Text>{" "}
							has been received.
						</Text>
					) : (
						<Text className="text-base text-gray-600 text-center">
							Your registration has been received.
						</Text>
					)}
					<Text className="text-sm text-gray-500 text-center">
						We look forward to seeing you at the event.
					</Text>
					<SharedButton
						title="Done"
						onPress={handleDone}
						className="w-full mt-4"
					/>
				</View>
			</SafeAreaView>
		</SharedBody>
	);
};

export default EventConfirmationScreen;
