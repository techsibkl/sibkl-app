import { Event, EventParticipant } from "@/services/Event/event.type";
import { isEventCheckInOpen } from "@/utils/eventRegistrationGates";
import { CheckCircle2Icon, QrCodeIcon } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type EventCheckInSectionProps = {
	event: Event;
	participant: EventParticipant;
	onScanPress: () => void;
};

function formatCheckedInTime(checkedInAt?: string | null): string | null {
	if (!checkedInAt) return null;
	const date = new Date(checkedInAt);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleTimeString("en-MY", {
		hour: "numeric",
		minute: "2-digit",
	});
}

const EventCheckInSection = ({
	event,
	participant,
	onScanPress,
}: EventCheckInSectionProps) => {
	const isCheckedIn = Boolean(participant.checked_in);
	const canScan = !isCheckedIn && isEventCheckInOpen(event);
	const checkedInTime = formatCheckedInTime(participant.checked_in_at);

	const primaryText = isCheckedIn
		? "You're checked in"
		: canScan
			? "Check in"
			: "Check-in unavailable";

	const secondaryText = isCheckedIn
		? checkedInTime
			? `Checked in at ${checkedInTime}`
			: "Enjoy the event!"
		: canScan
			? "Tap the QR to check in"
			: "Check-in is not open yet.";

	return (
		<View
			className={`flex-row items-center gap-4 rounded-3xl border p-5 ${
				isCheckedIn
					? "bg-success-50 border-success-200"
					: "bg-white border-border"
			}`}
			style={
				isCheckedIn
					? undefined
					: {
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.04,
							shadowRadius: 8,
							elevation: 2,
						}
			}
		>
			<View className="flex-1 gap-1">
				<Text
					className={`text-xl font-bold ${
						isCheckedIn ? "text-success-700" : "text-text"
					}`}
				>
					{primaryText}
				</Text>
				<Text
					className={`text-sm leading-5 ${
						isCheckedIn ? "text-success-600" : "text-gray-500"
					}`}
				>
					{secondaryText}
				</Text>
			</View>

			{isCheckedIn ? (
				<CheckCircle2Icon size={32} color="#16a34a" strokeWidth={2} />
			) : (
				<TouchableOpacity
					onPress={onScanPress}
					disabled={!canScan}
					activeOpacity={0.7}
					hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
					accessibilityRole="button"
					accessibilityLabel="Check in by scanning QR code"
					className="p-1"
				>
					<QrCodeIcon
						size={36}
						color={canScan ? "#111827" : "#d1d5db"}
						strokeWidth={1.6}
					/>
				</TouchableOpacity>
			)}
		</View>
	);
};

export default EventCheckInSection;
