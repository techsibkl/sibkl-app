import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

/** @deprecated Use qrScan directly — kept for existing deep links. */
const EventScannerPage = () => {
	const { eventId, participantId } = useLocalSearchParams<{
		eventId: string;
		participantId: string;
	}>();

	useEffect(() => {
		const eventIdParam = Array.isArray(eventId) ? eventId[0] : eventId;
		const participantIdParam = Array.isArray(participantId)
			? participantId[0]
			: participantId;

		router.replace({
			pathname: "/(app)/events/qrScan",
			params: {
				eventId: eventIdParam,
				participantId: participantIdParam,
			},
		});
	}, [eventId, participantId]);

	return (
		<View className="flex-1 bg-white items-center justify-center">
			<ActivityIndicator size="large" color="#d6361e" />
		</View>
	);
};

export default EventScannerPage;
