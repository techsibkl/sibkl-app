import EventCard from "@/components/Events/EventCard";
import { Event } from "@/services/Event/event.type";
import { isEventPublished } from "@/utils/eventRegistrationGates";
import { FlashList } from "@shopify/flash-list";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

type EventListProps = {
	events: Event[];
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

const EventList = ({ events }: EventListProps) => {
	const publishedEvents = useMemo(
		() => events.filter((event) => isEventPublished(event)),
		[events],
	);

	return (
		<FlashList
			data={publishedEvents}
			contentContainerStyle={{
				paddingHorizontal: 16,
				paddingBottom: 24,
				paddingTop: 8,
			}}
			ItemSeparatorComponent={() => <View className="h-4" />}
			renderItem={({ item }) => <EventCard event={item} />}
			ListEmptyComponent={<EventListEmpty />}
			estimatedItemSize={130}
		/>
	);
};

export default EventList;
