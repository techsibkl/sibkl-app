import { Event, EventParticipant } from "@/services/Event/event.type";
import { isEventCheckInOpen } from "@/utils/eventRegistrationGates";
import {
	CheckCircle2Icon,
	ScanQrCodeIcon,
	TicketIcon,
} from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

type EventCheckInSectionProps = {
	event: Event;
	participant: EventParticipant;
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
}: EventCheckInSectionProps) => {
	const isCheckedIn = Boolean(participant.checked_in);
	const checkInOpen = isEventCheckInOpen(event);
	const checkedInTime = formatCheckedInTime(participant.checked_in_at);

	return (
		<View className="gap-4">
			{/* Registration status */}
			<View className="bg-white rounded-3xl border border-border p-5 gap-3">
				<Text className="text-xs font-bold text-gray-400 tracking-widest uppercase">
					Your registration
				</Text>
				<View className="flex-row items-center gap-3">
					<View className="h-11 w-11 rounded-full bg-secondary-50 items-center justify-center">
						<TicketIcon size={20} color="#699EFF" />
					</View>
					<View className="flex-1 gap-0.5">
						<Text className="text-base font-semibold text-text">
							{participant.full_name}
						</Text>
						<Text className="text-sm text-success-600 font-medium">
							Registered
						</Text>
					</View>
				</View>
			</View>

			{/* Check-in card */}
			<View
				className={`rounded-3xl border overflow-hidden ${
					isCheckedIn
						? "bg-success-50 border-success-200"
						: checkInOpen
							? "bg-white border-border"
							: "bg-gray-50 border-border"
				}`}
				style={
					checkInOpen && !isCheckedIn
						? {
								shadowColor: "#000",
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.06,
								shadowRadius: 12,
								elevation: 3,
							}
						: undefined
				}
			>
				<View className="p-5 gap-4">
					<Text className="text-xs font-bold text-gray-400 tracking-widest uppercase">
						Check-in
					</Text>

					{isCheckedIn ? (
						<View className="flex-row items-center gap-4">
							<View className="h-14 w-14 rounded-2xl bg-success-100 items-center justify-center">
								<CheckCircle2Icon
									size={28}
									color="#16a34a"
									strokeWidth={2}
								/>
							</View>
							<View className="flex-1 gap-1">
								<Text className="text-lg font-bold text-success-700">
									You're checked in
								</Text>
								{checkedInTime ? (
									<Text className="text-sm text-success-600">
										Checked in at {checkedInTime}
									</Text>
								) : (
									<Text className="text-sm text-success-600">
										Enjoy the event!
									</Text>
								)}
							</View>
						</View>
					) : checkInOpen ? (
						<View className="flex-row items-center gap-4">
							<View
								className="h-16 w-16 rounded-2xl bg-primary-50 border-2 border-primary-200 items-center justify-center"
								style={{
									shadowColor: "#d6361e",
									shadowOffset: { width: 0, height: 2 },
									shadowOpacity: 0.12,
									shadowRadius: 6,
									elevation: 2,
								}}
							>
								<ScanQrCodeIcon
									size={32}
									color="#d6361e"
									strokeWidth={1.75}
								/>
							</View>
							<View className="flex-1 gap-1">
								<Text className="text-base font-bold text-text">
									Scan QR at the venue
								</Text>
								<Text className="text-sm text-gray-500 leading-5">
									Find the event QR code on-site and tap
									Check In below to open the scanner.
								</Text>
							</View>
						</View>
					) : (
						<View className="flex-row items-center gap-4 opacity-70">
							<View className="h-14 w-14 rounded-2xl bg-gray-100 items-center justify-center">
								<ScanQrCodeIcon
									size={26}
									color="#9ca3af"
									strokeWidth={1.75}
								/>
							</View>
							<View className="flex-1 gap-1">
								<Text className="text-base font-semibold text-gray-600">
									Check-in unavailable
								</Text>
								<Text className="text-sm text-gray-400 leading-5">
									Check-in is not open for this event yet.
								</Text>
							</View>
						</View>
					)}
				</View>
			</View>
		</View>
	);
};

export default EventCheckInSection;
