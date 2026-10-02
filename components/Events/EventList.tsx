import EventCard from "@/components/Events/EventCard";
import { Event } from "@/services/Event/event.type";
import { isEventPublished } from "@/utils/eventRegistrationGates";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { RefreshControl, Text, View } from "react-native";

type EventListProps = {
	events: Event[];
	onRefresh?: () => Promise<unknown>;
};

const EventListEmpty = () => (
	<View className="flex-1 items-center justify-center px-8 pt-20">
		<Text className="text-base font-semibold text-gray-700 text-center">
			No events available
		</Text>
		<Text className="text-sm text-gray-500 text-center mt-2">
			Check back later for upcoming events you can register for.
		</Text>
	</View>
);

const EventList = ({ events, onRefresh }: EventListProps) => {
	const [refreshing, setRefreshing] = useState(false);
	// Incremented after every pull-to-refresh so FlashList re-renders all items
	// even when the server returns structurally-identical data. This ensures
	// time-based gates (registration open/close) are re-evaluated with the
	// current wall-clock time after each refresh.
	const [refreshKey, setRefreshKey] = useState(0);
	const queryClient = useQueryClient();
	const publishedEvents = useMemo(
		() => events.filter((event) => isEventPublished(event)),
		[events],
	);

	const handleRefresh = async () => {
		if (!onRefresh) return;
		setRefreshing(true);
		try {
			await onRefresh();
		} finally {
			setRefreshKey((k) => k + 1);
			setRefreshing(false);
		}
	};

	return (
		<FlashList
			data={publishedEvents}
			extraData={refreshKey}
			contentContainerStyle={{
				paddingHorizontal: 16,
				paddingBottom: 24,
				paddingTop: 8,
			}}
			ItemSeparatorComponent={() => <View className="h-4" />}
			renderItem={({ item }) => <EventCard key={item.id} event={item} />}
			ListEmptyComponent={<EventListEmpty />}
			estimatedItemSize={130}
			refreshControl={
				onRefresh ? (
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						colors={["#d6361e"]}
						tintColor="#d6361e"
					/>
				) : undefined
			}
		/>
	);
};

export default EventList;
