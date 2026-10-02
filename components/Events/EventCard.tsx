import { Event, EventParticipant } from "@/services/Event/event.type";
import { isEventRegisterable } from "@/utils/eventRegistrationGates";
import { useRouter } from "expo-router";
import {
	Calendar1Icon,
	CheckCircle2Icon,
	ChevronRightIcon,
	CircleIcon,
	MapPinIcon,
	XCircleIcon,
} from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type EventCardProps = {
	event: Event;
	participant?: EventParticipant;
};

type RegistrationState = "registered" | "open" | "closed";

function getRegistrationState(
	event: Event,
	participant?: EventParticipant,
): RegistrationState {
	if (participant) return "registered";
	if (isEventRegisterable(event)) return "open";
	return "closed";
}

function parseDateParts(dateString?: string | null): {
	day: string;
	month: string;
	fullDate: string;
	time: string;
} | null {
	if (!dateString) return null;
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return null;
	return {
		day: date.toLocaleDateString("en-MY", { day: "numeric" }),
		month: date
			.toLocaleDateString("en-MY", { month: "short" })
			.toUpperCase(),
		fullDate: date.toLocaleDateString("en-MY", {
			weekday: "short",
			day: "numeric",
			month: "short",
			year: "numeric",
		}),
		time: date.toLocaleTimeString("en-MY", {
			hour: "numeric",
			minute: "2-digit",
		}),
	};
}

const REG_CHIP_CONFIG: Record<
	RegistrationState,
	{
		label: string;
		bg: string;
		border: string;
		color: string;
		Icon: typeof CheckCircle2Icon;
	}
> = {
	registered: {
		label: "Registered",
		bg: "bg-green-50",
		border: "border-green-200",
		color: "#16a34a",
		Icon: CheckCircle2Icon,
	},
	open: {
		label: "Open",
		bg: "bg-amber-50",
		border: "border-amber-200",
		color: "#f59e0b",
		Icon: CircleIcon,
	},
	closed: {
		label: "Closed",
		bg: "bg-gray-50",
		border: "border-gray-200",
		color: "#9CA3AF",
		Icon: XCircleIcon,
	},
};

const EventCard = ({ event, participant }: EventCardProps) => {
	const router = useRouter();
	const dateParts = parseDateParts(event.start_at);
	const regState = getRegistrationState(event, participant);
	const regChip = REG_CHIP_CONFIG[regState];

	const handlePress = () => {
		router.push({
			pathname: "/(app)/events/[eventId]",
			params: { eventId: String(event.id) },
		});
	};

	return (
		<TouchableOpacity
			onPress={handlePress}
			activeOpacity={0.75}
			className="bg-white rounded-2xl border border-border overflow-hidden"
			style={{
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.05,
				shadowRadius: 6,
				elevation: 2,
			}}
		>
			<View className="flex-row">
				{/* Date block */}
				{dateParts ? (
					<View className="bg-primary-50 items-center justify-center px-4 py-5 min-w-[68px]">
						<Text className="text-xs font-bold text-primary-400 tracking-wider">
							{dateParts.month}
						</Text>
						<Text className="text-3xl font-bold text-primary-600 leading-9">
							{dateParts.day}
						</Text>
					</View>
				) : null}

				{/* Vertical divider */}
				{dateParts ? (
					<View className="w-px bg-border self-stretch" />
				) : null}

				{/* Content */}
				<View className="flex-1 px-4 py-4 gap-1.5 justify-center">
					<Text
						className="text-base font-bold text-text"
						numberOfLines={2}
					>
						{event.name}
					</Text>

					{dateParts && (
						<View className="flex-row items-center gap-1.5">
							<Calendar1Icon size={13} color="#9CA3AF" />
							<Text className="text-xs text-gray-500">
								{dateParts.fullDate} · {dateParts.time}
							</Text>
						</View>
					)}

					{event.venue ? (
						<View className="flex-row items-center gap-1.5">
							<MapPinIcon size={13} color="#9CA3AF" />
							<Text
								className="text-xs text-gray-500 flex-1"
								numberOfLines={1}
							>
								{event.venue}
							</Text>
						</View>
					) : null}

					{event.description ? (
						<Text
							className="text-xs text-gray-400 leading-4"
							numberOfLines={2}
						>
							{event.description}
						</Text>
					) : null}

					{/* Status chips */}
					<View className="flex-row gap-1.5 flex-wrap mt-0.5">
						{/* Registration state chip — always visible */}
						<View
							className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full border ${regChip.bg} ${regChip.border}`}
						>
							<regChip.Icon size={10} color={regChip.color} />
							<Text
								className="text-[10px] font-semibold uppercase tracking-wide"
								style={{ color: regChip.color }}
							>
								{regChip.label}
							</Text>
						</View>

						{/* Checked-in chip — only when participant data is available */}
						{participant !== undefined && (
							<View
								className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full border ${participant.checked_in ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}
							>
								{participant.checked_in ? (
									<CheckCircle2Icon
										size={10}
										color="#2563eb"
									/>
								) : (
									<XCircleIcon size={10} color="#9CA3AF" />
								)}
								<Text
									className={`text-[10px] font-semibold uppercase tracking-wide ${participant.checked_in ? "text-blue-600" : "text-gray-400"}`}
								>
									{participant.checked_in
										? "Checked In"
										: "Not Checked In"}
								</Text>
							</View>
						)}
					</View>
				</View>

				{/* Chevron */}
				<View className="items-center justify-center pr-3">
					<ChevronRightIcon size={18} color="#D1D5DB" />
				</View>
			</View>
		</TouchableOpacity>
	);
};

export default EventCard;
