import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColor";
import { CardCellGroupProps } from "./types";
import { Avatar } from "./Avatar";
import { InfoRow } from "./InfoRow";
import { ActionButton } from "./ActionButton";
import { Clock, MapPin, Users } from "lucide-react-native";

/**
 * CardCellGroup: Professional, reusable card component
 *
 * Features:
 * - Responsive design
 * - Dark mode support
 * - Customizable via props
 * - Icon integration
 * - Loading states
 * - Accessibility
 *
 * @example
 * <CardCellGroup
 *   id={1}
 *   avatarInitials="RG"
 *   title="ABIDE (CC Cell group)"
 *   meetingDay="Saturday"
 *   meetingTime="7:30 p.m"
 *   location="SIBKL (Sidang Injil Borneo Kuala Lumpur)"
 *   leaderName="RYAN GUI"
 *   actionLabel="Join CG +"
 *   onActionPress={() => handleJoin(1)}
 * />
 */
export const CardCellGroup: React.FC<CardCellGroupProps> = ({
	avatarInitials,
	avatarUrl,
	title,
	meetingDay,
	meetingTime,
	location,
	leaderName,
	actionLabel = "Join CG +",
	onActionPress,
	isLoading = false,
}) => {
	const { isDark } = useThemeColors();

	return (
		<View
			className={`rounded-2xl p-4 mb-4 flex-row gap-4 ${
				isDark
					? "bg-slate-800 border border-slate-700"
					: "bg-white border border-gray-200"
			}`}
			style={{ shadowColor: "#000", elevation: 2 }}
		>
			{/* Left: Avatar */}
			<Avatar initials={avatarInitials} imageUrl={avatarUrl} size="lg" />

			{/* Middle: Content */}
			<View className="flex-1">
				{/* Title */}
				<Text
					className={`text-base font-bold mb-2 ${
						isDark ? "text-white" : "text-gray-800"
					}`}
				>
					{title}
				</Text>

				{/* Info Rows - Compact */}
				<View className="gap-1">
					{meetingDay && meetingTime && (
						<InfoRow
							icon={
								<Clock
									size={14}
									color="#999"
									strokeWidth={1.5}
								/>
							}
							value={`${meetingDay}, ${meetingTime}`}
						/>
					)}

					{location && (
						<InfoRow
							icon={
								<MapPin
									size={14}
									color="#999"
									strokeWidth={1.5}
								/>
							}
							value={location}
						/>
					)}

					{leaderName && (
						<InfoRow
							icon={
								<Users
									size={14}
									color="#999"
									strokeWidth={1.5}
								/>
							}
							value={leaderName}
						/>
					)}
				</View>
			</View>

			{/* Right: Action Button */}
			<View className="justify-center">
				<ActionButton
					label={actionLabel}
					onPress={onActionPress}
					variant="outline"
					isLoading={isLoading}
					size="sm"
				/>
			</View>
		</View>
	);
};
