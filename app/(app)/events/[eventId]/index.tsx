import EventDetailContent from "@/components/Events/EventDetailContent";
import EventDetailFooter from "@/components/Events/EventDetailFooter";
import EventRegistrationClosed from "@/components/Events/EventRegistrationClosed";
import SharedBody from "@/components/shared/SharedBody";
import SkeletonList from "@/components/shared/Skeleton/SkeletonList";
import { useEventQuery } from "@/hooks/Event/useEventQuery";
import { useAuthStore } from "@/stores/authStore";
import {
	getRegistrationClosedMessage,
	isEventRegisterable,
} from "@/utils/eventRegistrationGates";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const EventDetailScreen = () => {
	const { eventId } = useLocalSearchParams<{ eventId: string }>();
	const router = useRouter();
	const { isGuest } = useAuthStore();

	const {
		data: event,
		isPending,
		isError,
		error: fetchError,
	} = useEventQuery(eventId);

	if (isGuest) {
		return <Redirect href="/(auth)/sign-in" />;
	}

	if (isPending) {
		return (
			<SharedBody>
				<SkeletonList length={5} />
			</SharedBody>
		);
	}

	if (isError || !event) {
		return (
			<SharedBody>
				<View className="px-4 pt-8">
					<Text className="text-center text-red-500">
						{(fetchError as any)?.message ??
							"Failed to load event. Please try again."}
					</Text>
				</View>
			</SharedBody>
		);
	}

	const registerable = isEventRegisterable(event);
	const closedMessage = getRegistrationClosedMessage(event);

	const handleRegister = () => {
		if (!registerable) return;
		router.push({
			pathname: "/(app)/events/[eventId]/register",
			params: { eventId: String(eventId) },
		});
	};

	return (
		<SharedBody>
			<View className="flex-1">
				<ScrollView
					className="flex-1"
					contentContainerStyle={{
						padding: 16,
						paddingBottom: 120,
						gap: 16,
					}}
				>
					<EventDetailContent event={event} />
					{!registerable && (
						<EventRegistrationClosed message={closedMessage} />
					)}
				</ScrollView>
				<EventDetailFooter
					registerable={registerable}
					onRegister={handleRegister}
				/>
			</View>
		</SharedBody>
	);
};

export default EventDetailScreen;
