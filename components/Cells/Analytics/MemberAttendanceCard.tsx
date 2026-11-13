import { CellAttendanceStat } from "@/services/CellAttendance/cellAttendance.type";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

type MemberRole = "leader" | "zone-leader" | "core" | "member";

type Props = {
	stat: CellAttendanceStat;
	role?: MemberRole;
	cellId?: number;
};

const roleLabel: Record<MemberRole, string> = {
	leader: "Leader",
	"zone-leader": "Zone Leader",
	core: "Core",
	member: "Member",
};

const roleClass: Record<MemberRole, string> = {
	leader: "bg-blue-100",
	"zone-leader": "bg-violet-100",
	core: "bg-red-50",
	member: "bg-gray-100",
};

const roleTextClass: Record<MemberRole, string> = {
	leader: "text-blue-700",
	"zone-leader": "text-violet-700",
	core: "text-red-600",
	member: "text-gray-500",
};

/** Backend sends 0–1 ratios (e.g. 0.5); show as 0–100. */
const toAttendancePercent = (rate: number) => {
	if (!Number.isFinite(rate)) return 0;
	return Math.round(rate <= 1 ? rate * 100 : rate);
};

export default function MemberAttendanceCard({
	stat,
	role = "member",
	cellId,
}: Props) {
	const attendancePercent = toAttendancePercent(stat.attendance_rate);

	const handlePress = () => {
		if (stat.people_id) {
			router.push({
				pathname: "/(app)/profile/[id]",
				params: {
					id: String(stat.people_id),
					backPath: `/(app)/cells/profile/${cellId}`,
				},
			});
		}
	};

	return (
		<Pressable onPress={handlePress} className="mb-2">
			<View className="flex-row items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 gap-3">
				<View className="flex-1 gap-1">
					<View className="flex-row items-center gap-2 flex-wrap">
						<Text
							className="text-base font-semibold text-gray-900 flex-shrink"
							numberOfLines={1}
						>
							{stat.full_legal_name || "Unknown member"}
						</Text>
						<View className={`rounded-full px-2 py-0.5 ${roleClass[role]}`}>
							<Text className={`text-xs font-semibold ${roleTextClass[role]}`}>
								{roleLabel[role]}
							</Text>
						</View>
					</View>

					{/* Session attendance progress */}
					<View className="flex-row items-center gap-2 mt-1">
						<View className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
							<View
								className="h-full bg-red-600 rounded-full"
								style={{
									width: `${stat.total_sessions > 0 ? (stat.sessions_attended / stat.total_sessions) * 100 : 0}%`,
								}}
							/>
						</View>
						<Text className="text-xs text-gray-400 w-12 text-right">
							{stat.sessions_attended}/{stat.total_sessions}
						</Text>
					</View>
				</View>

				<Text className="text-lg font-bold text-gray-900 w-12 text-right">
					{attendancePercent}%
				</Text>
			</View>
		</Pressable>
	);
}
