import EventDetailContent from "@/components/Events/EventDetailContent";
import EventDetailFooter, {
	EventDetailFooterMode,
} from "@/components/Events/EventDetailFooter";
import EventRegistrationClosed from "@/components/Events/EventRegistrationClosed";
import SharedBody from "@/components/shared/SharedBody";
import SkeletonList from "@/components/shared/Skeleton/SkeletonList";
import { useEventQuery } from "@/hooks/Event/useEventQuery";
import { useMyEventRegistrationsQuery } from "@/hooks/Event/useMyEventRegistrationsQuery";
import { useAuthStore } from "@/stores/authStore";
import {
	getRegistrationClosedMessage,
	isEventCheckInOpen,
	isEventRegisterable,
} from "@/utils/eventRegistrationGates";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";

const EventDetailScreen = () => {
	const { eventId } = useLocalSearchParams<{ eventId: string }>();
	const router = useRouter();
	const { isGuest } = useAuthStore();
	const { data: myRegistrations = [] } = useMyEventRegistrationsQuery();

	const {
		data: event,
		isPending,
		isError,
		error: fetchError,
	} = useEventQuery(eventId);

	const registration = useMemo(
		() =>
			myRegistrations.find(
				(item) => String(item.event.id) === String(eventId),
			),
		[myRegistrations, eventId],
	);

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
	const participant = registration?.participant;

	let footerMode: EventDetailFooterMode = "closed";
	if (participant) {
		if (participant.checked_in) {
			footerMode = "checked_in";
		} else if (isEventCheckInOpen(event)) {
			footerMode = "checkin";
		} else {
			footerMode = "checkin_unavailable";
		}
	} else if (registerable) {
		footerMode = "register";
	}

	const handleFooterPress = () => {
		if (footerMode === "register") {
			router.push({
				pathname: "/(app)/events/[eventId]/register",
				params: { eventId: String(eventId) },
			});
			return;
		}

		if (footerMode === "checkin" && participant?.id) {
			router.push({
				pathname: "/(app)/events/qrScan",
				params: {
					eventId: String(eventId),
					participantId: String(participant.id),
				},
			});
		}
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
					{!registerable && !participant && (
						<EventRegistrationClosed message={closedMessage} />
					)}
				</ScrollView>
				<EventDetailFooter mode={footerMode} onPress={handleFooterPress} />
			</View>
		</SharedBody>
	);
};

export default EventDetailScreen;
