import { CellSession } from "@/services/CellAttendance/cellAttendance.type";
import React from "react";
import { Pressable, Text, View } from "react-native";

const TODAY = new Date(new Date().setHours(0, 0, 0, 0));

const isUpcomingOrLive = (session: CellSession) =>
	new Date(session.meeting_date) >= TODAY;

type Props = {
	session: CellSession;
	onPress: () => void;
};

export default function SessionCard({ session, onPress }: Props) {
	const date = new Date(session.meeting_date);
	const isToday = date.toDateString() === new Date().toDateString();
	const isUpcoming = isUpcomingOrLive(session);
	const attendanceRate =
		session.total_members > 0
			? Math.round((session.attendee_count / session.total_members) * 100)
			: 0;

	return (
		<Pressable
			onPress={onPress}
			className="flex-row items-center bg-white rounded-2xl p-4 border border-gray-100 gap-3 mb-2"
			style={{ elevation: 2 }}
		>
			<View
				className={`w-12 h-14 rounded-xl items-center justify-center ${
					isToday
						? "bg-red-600"
						: isUpcoming
							? "bg-red-50 border-2 border-red-600"
							: "bg-gray-100"
				}`}
			>
				<Text
					className={`text-xs font-semibold tracking-widest leading-none mb-0.5 ${
						isToday
							? "text-white"
							: isUpcoming
								? "text-red-600"
								: "text-gray-400"
					}`}
				>
					{date
						.toLocaleString("default", { month: "short" })
						.toUpperCase()}
				</Text>
				<Text
					className={`text-xl font-bold leading-none ${
						isToday
							? "text-white"
							: isUpcoming
								? "text-red-600"
								: "text-gray-500"
					}`}
				>
					{date.getDate()}
				</Text>
			</View>

			<View className="flex-1 gap-1">
				<View className="flex-row items-center gap-2 flex-wrap">
					<Text className="text-base font-bold text-gray-900">
						{isToday
							? "Today's Session"
							: isUpcoming
								? "Upcoming Session"
								: "Past Session"}
					</Text>
					{isToday && (
						<View className="bg-red-600 rounded px-1.5 py-0.5">
							<Text className="text-white text-xs font-bold tracking-wide">
								LIVE
							</Text>
						</View>
					)}
					{isUpcoming && !isToday && (
						<View className="bg-red-50 border border-red-600 rounded px-1.5 py-0.5">
							<Text className="text-red-600 text-xs font-bold tracking-wide">
								UPCOMING
							</Text>
						</View>
					)}
				</View>

				<Text className="text-xs text-gray-400">
					{date.toLocaleDateString("default", {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</Text>

				{!isUpcoming && (
					<View className="flex-row items-center gap-2 mt-1">
						<View className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
							<View
								className="h-full bg-red-600 rounded-full"
								style={{ width: `${attendanceRate}%` }}
							/>
						</View>
						<Text className="text-xs text-gray-400">
							{session.attendee_count}/{session.total_members}
						</Text>
					</View>
				)}

				{isToday && session.attendee_count > 0 && (
					<Text className="text-xs text-red-600 font-semibold mt-0.5">
						{session.attendee_count} checked in so far
					</Text>
				)}
			</View>

			<Text className="text-2xl text-gray-300 font-light">›</Text>
		</Pressable>
	);
}
