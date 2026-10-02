import { Event, EventParticipant } from "@/services/Event/event.type";
import { formatEventDateTime } from "@/utils/eventFormHelpers";
import { isEventRegisterable } from "@/utils/eventRegistrationGates";
import {
	Calendar1Icon,
	CheckCircle2Icon,
	CircleIcon,
	ClockIcon,
	MapPinIcon,
	XCircleIcon,
} from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

type EventDetailContentProps = {
	event: Event;
	participant?: EventParticipant;
};

function parseEventDate(dateString?: string | null) {
	if (!dateString) return null;
	const date = new Date(dateString);
	return Number.isNaN(date.getTime()) ? null : date;
}

function formatEventDateLabel(dateString?: string | null): string {
	const date = parseEventDate(dateString);
	if (!date) return "Date TBC";
	return date.toLocaleDateString("en-MY", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function formatEventTimeLabel(dateString?: string | null): string | null {
	const date = parseEventDate(dateString);
	if (!date) return null;
	return date.toLocaleTimeString("en-MY", {
		hour: "numeric",
		minute: "2-digit",
	});
}

const InfoRow = ({
	icon,
	label,
	value,
	subValue,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	subValue?: string | null;
}) => (
	<View className="flex-row items-start gap-3">
		<View className="h-10 w-10 rounded-xl bg-primary-50 items-center justify-center">
			{icon}
		</View>
		<View className="flex-1 gap-0.5 pt-0.5">
			<Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
				{label}
			</Text>
			<Text className="text-base font-semibold text-text">{value}</Text>
			{subValue ? (
				<Text className="text-sm text-gray-500">{subValue}</Text>
			) : null}
		</View>
	</View>
);

const EventDetailContent = ({
	event,
	participant,
}: EventDetailContentProps) => {
	const startTime = formatEventTimeLabel(event.start_at);
	const endTime = formatEventTimeLabel(event.end_at);
	const timeRange =
		startTime && endTime
			? `${startTime} – ${endTime}`
			: startTime
				? startTime
				: null;

	return (
		<View className="gap-4">
			{/* Hero card */}
			<View className="bg-white rounded-2xl overflow-hidden border-t-4 border-primary-500">
				<View className="p-5 gap-4">
					<Text className="text-2xl font-bold text-text leading-8">
						{event.name}
					</Text>
					{/* Status chips */}
					<View className="flex-row gap-2 flex-wrap">
						{/* Registration state — 3-way: Registered / Open / Closed */}
						{(() => {
							const isRegistered = !!participant;
						const isOpen =
							!isRegistered && isEventRegisterable(event);
							const bg = isRegistered
								? "bg-green-50 border-green-200"
								: isOpen
									? "bg-amber-50 border-amber-200"
									: "bg-gray-50 border-gray-200";
							const color = isRegistered
								? "#16a34a"
								: isOpen
									? "#f59e0b"
									: "#9CA3AF";
							const label = isRegistered
								? "Registered"
								: isOpen
									? "Open"
									: "Closed";
							const Icon = isRegistered
								? CheckCircle2Icon
								: isOpen
									? CircleIcon
									: XCircleIcon;
							return (
								<View
									className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full border ${bg}`}
								>
									<Icon size={12} color={color} />
									<Text
										className="text-xs font-semibold uppercase tracking-wide"
										style={{ color }}
									>
										{label}
									</Text>
								</View>
							);
						})()}

						{/* Check-in status */}
						<View
							className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full border ${participant?.checked_in ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}
						>
							{participant?.checked_in ? (
								<CheckCircle2Icon size={12} color="#2563eb" />
							) : (
								<XCircleIcon size={12} color="#9CA3AF" />
							)}
							<Text
								className={`text-xs font-semibold uppercase tracking-wide ${participant?.checked_in ? "text-blue-600" : "text-gray-400"}`}
							>
								{participant?.checked_in
									? "Checked In"
									: "Not Checked In"}
							</Text>
						</View>
					</View>
				</View>
			</View>

			{/* Date & location */}
			<View
				className="bg-white rounded-2xl p-5 gap-5"
				style={{
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.04,
					shadowRadius: 8,
					elevation: 2,
				}}
			>
				{event.start_at && (
					<InfoRow
						icon={<Calendar1Icon size={18} color="#d6361e" />}
						label="Date"
						value={formatEventDateLabel(event.start_at)}
						subValue={timeRange}
					/>
				)}
				{event.end_at && !timeRange && (
					<InfoRow
						icon={<ClockIcon size={18} color="#d6361e" />}
						label="Ends"
						value={formatEventDateTime(event.end_at)}
					/>
				)}
				{event.venue ? (
					<>
						{(event.start_at || event.end_at) && (
							<View className="h-px bg-border" />
						)}
						<InfoRow
							icon={<MapPinIcon size={18} color="#d6361e" />}
							label="Venue"
							value={event.venue}
						/>
					</>
				) : null}
			</View>

			{/* About */}
			{/* {event.description ? (
				<View className="bg-white rounded-3xl border border-border p-5 gap-2">
					<Text className="text-xs font-bold text-gray-400 tracking-widest uppercase">
						About this event
					</Text>
					<Text className="text-sm text-gray-600 leading-6">
						{event.description}
					</Text>
				</View>
			) : null} */}
		</View>
	);
};

export default EventDetailContent;
