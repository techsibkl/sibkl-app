import SharedButton from "@/components/shared/SharedButton";
import { EventRegistration } from "@/services/Event/event.type";
import { formatEventDateTime } from "@/utils/eventFormHelpers";
import { isEventCheckInOpen } from "@/utils/eventRegistrationGates";
import { useRouter } from "expo-router";
import { Calendar1Icon, ChevronRight, MapPinIcon } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type MyEventCardProps = {
	registration: EventRegistration;
};

const MyEventCard = ({ registration }: MyEventCardProps) => {
	const router = useRouter();
	const { event, participant } = registration;

	const handlePress = () => {
		router.push({
			pathname: "/(app)/events/[eventId]/",
			params: { eventId: String(event.id) },
		});
	};

	const handleCheckIn = () => {
		if (!participant.id || participant.checked_in || !isEventCheckInOpen(event)) {
			return;
		}
		router.push({
			pathname: "/(app)/events/qrScan",
			params: {
				eventId: String(event.id),
				participantId: String(participant.id),
			},
		});
	};

	const checkInOpen = isEventCheckInOpen(event);
	const isCheckedIn = Boolean(participant.checked_in);
	const checkInTitle = isCheckedIn
		? "Checked in"
		: checkInOpen
			? "Check In"
			: "Check-in unavailable";

	return (
		<View className="bg-white rounded-2xl border border-border p-4 gap-3">
			<TouchableOpacity
				onPress={handlePress}
				activeOpacity={0.8}
				className="gap-3"
			>
				<View className="flex-row items-start gap-2">
					<View className="flex-1 gap-3">
						<Text className="text-lg font-bold text-text">
							{event.name}
						</Text>
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
							<Text
								className="text-sm text-gray-500"
								numberOfLines={2}
							>
								{event.description}
							</Text>
						) : null}
					</View>
					<View className="pt-1">
						<ChevronRight size={20} color="#9CA3AF" />
					</View>
				</View>
			</TouchableOpacity>

			<SharedButton
				title={checkInTitle}
				onPress={handleCheckIn}
				disabled={isCheckedIn || !checkInOpen}
			/>
		</View>
	);
};

export default MyEventCard;
