import { Event } from "@/services/Event/event.type";
import { formatEventDateTime } from "@/utils/eventFormHelpers";
import { useRouter } from "expo-router";
import { Calendar1Icon, ChevronRight, MapPinIcon } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type EventCardProps = {
	event: Event;
};

const EventCard = ({ event }: EventCardProps) => {
	const router = useRouter();

	const handlePress = () => {
		router.push({
			pathname: "/(app)/events/qrScan/",
			params: { eventId: String(event.id) },
		});
	};

	return (
		<TouchableOpacity
			onPress={handlePress}
			activeOpacity={0.8}
			className="bg-white rounded-2xl border border-border p-4 gap-3"
		>
			<View className="flex-row items-start gap-2">
				<View className="flex-1 gap-3">
					<Text className="text-lg font-bold text-text">{event.name}</Text>
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
							<Text className="text-sm text-gray-600 flex-1">
								{event.venue}
							</Text>
						</View>
					)}
					{event.description ? (
						<Text className="text-sm text-gray-500" numberOfLines={2}>
							{event.description}
						</Text>
					) : null}
				</View>
				<View className="pt-1">
					<ChevronRight size={20} color="#9CA3AF" />
				</View>
			</View>
		</TouchableOpacity>
	);
};

export default EventCard;
