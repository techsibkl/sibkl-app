import MyEventCard from "@/components/Events/MyEventCard";
import { EventRegistration } from "@/services/Event/event.type";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { Pressable, Text, View } from "react-native";

type MyEventListProps = {
	registrations: EventRegistration[];
	onBrowseEvents?: () => void;
};

const MyEventListEmpty = ({
	onBrowseEvents,
}: {
	onBrowseEvents?: () => void;
}) => (
	<View className="flex-1 items-center justify-center px-8 pt-20">
		<Text className="text-base font-semibold text-gray-700 text-center">
			No registered events
		</Text>
		<Text className="text-sm text-gray-500 text-center mt-2">
			Events you register for will appear here.
		</Text>
		{onBrowseEvents ? (
			<Pressable
				onPress={onBrowseEvents}
				className="mt-6 bg-primary-500 px-6 py-3 rounded-lg"
			>
				<Text className="text-white font-semibold text-center">
					Browse events
				</Text>
			</Pressable>
		) : null}
	</View>
);

const MyEventList = ({ registrations, onBrowseEvents }: MyEventListProps) => (
	<FlashList
		data={registrations}
		keyExtractor={(item) =>
			`${item.event.id}-${item.participant.id ?? "unknown"}`
		}
		contentContainerStyle={{
			paddingHorizontal: 16,
			paddingBottom: 24,
			paddingTop: 8,
		}}
		ItemSeparatorComponent={() => <View className="h-4" />}
		renderItem={({ item }) => <MyEventCard registration={item} />}
		ListEmptyComponent={
			<MyEventListEmpty onBrowseEvents={onBrowseEvents} />
		}
		estimatedItemSize={180}
	/>
);

export default MyEventList;
