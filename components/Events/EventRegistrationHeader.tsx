import { Event } from "@/services/Event/event.type";
import { formatEventDateTime } from "@/utils/eventFormHelpers";
import { Calendar1Icon, MapPinIcon } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

type EventRegistrationHeaderProps = {
	event: Event;
};

const EventRegistrationHeader = ({ event }: EventRegistrationHeaderProps) => (
	<View className="bg-white rounded-2xl border border-border p-4 gap-3">
		<Text className="text-xl font-bold text-text">{event.name}</Text>
		{event.start_at && (
			<View className="flex-row items-center gap-2">
				<Calendar1Icon size={16} color="#6B7280" />
				<Text className="text-sm text-gray-600 flex-1">
					{formatEventDateTime(event.start_at)}
				</Text>
			</View>
		)}
		{event.venue && (
			<View className="flex-row items-center gap-2">
				<MapPinIcon size={16} color="#6B7280" />
				<Text className="text-sm text-gray-600 flex-1">{event.venue}</Text>
			</View>
		)}
	</View>
);

export default EventRegistrationHeader;
