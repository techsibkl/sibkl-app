import { Event } from "@/services/Event/event.type";
import { formatEventDateTime } from "@/utils/eventFormHelpers";
import { Calendar1Icon, MapPinIcon } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

type EventDetailContentProps = {
	event: Event;
};

const EventDetailContent = ({ event }: EventDetailContentProps) => (
	<View className="bg-white rounded-2xl border border-border p-4 gap-4">
		<Text className="text-xl font-bold text-text">{event.name}</Text>
		{event.start_at && (
			<View className="flex-row items-center gap-2">
				<Calendar1Icon size={16} color="#6B7280" />
				<Text className="text-sm text-gray-600 flex-1">
					{formatEventDateTime(event.start_at)}
				</Text>
			</View>
		)}
		{event.end_at && (
			<View className="flex-row items-center gap-2">
				<Calendar1Icon size={16} color="#6B7280" />
				<Text className="text-sm text-gray-600 flex-1">
					Ends {formatEventDateTime(event.end_at)}
				</Text>
			</View>
		)}
		{event.venue && (
			<View className="flex-row items-center gap-2">
				<MapPinIcon size={16} color="#6B7280" />
				<Text className="text-sm text-gray-600 flex-1">{event.venue}</Text>
			</View>
		)}
		{event.description ? (
			<Text className="text-sm text-gray-600 leading-5">{event.description}</Text>
		) : null}
	</View>
);

export default EventDetailContent;
