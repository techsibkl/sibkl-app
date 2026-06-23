import React from "react";
import { Text, View } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Cell } from "@/services/Cell/cell.types";
import { useRouter } from "expo-router";
import { Clock, MapPin, Users } from "lucide-react-native";
import { Avatar } from "./Avatar";
import { InfoRow } from "./InfoRow";
import { ActionButton } from "./ActionButton";

type TestCellCardProps = {
	cell: Cell;
	hasJoinedAnyCells?: boolean;
	onJoin?: (cellId: number) => void;
	onViewDetails?: (cell: Cell) => void;
};

/**
 * TestCellCard: Card component for displaying cells
 * Features same styling as CardCellGroup with action button
 *
 * @example
 * <TestCellCard cell={cell} hasJoinedAnyCells={false} onJoin={handleJoin} />
 */
export const TestCellCard: React.FC<TestCellCardProps> = ({ 
	cell, 
	hasJoinedAnyCells = false,
	onJoin,
	onViewDetails
}) => {
	const { isDark } = useThemeColors();
	const router = useRouter();

	const handleViewDetails = () => {
		if (onViewDetails) {
			onViewDetails(cell);
		}
	};

	const handleJoinPress = () => {
		if (onJoin && cell.id) {
			onJoin(cell.id);
		}
	};

	const infoRowCount = [
		cell.meeting_day && cell.meeting_time,
		cell.address,
		cell.cell_leader_1_name
	].filter(Boolean).length;
	
	const shouldCenterAvatar = infoRowCount >= 2;

	return (
		<View
			className={`rounded-2xl p-3 mb-3 flex-row gap-3 ${
				isDark
					? "bg-slate-800 border border-slate-700"
					: "bg-white border border-gray-200"
			}`}
			style={{ shadowColor: "#000", elevation: 0 }}
		>
			{/* Left: Avatar */}
			<View className={shouldCenterAvatar ? "justify-center" : "justify-start"}>
				<Avatar
					initials={cell.cell_name?.charAt(0) ?? "?"}
					size="md"
				/>
			</View>

			{/* Middle: Content */}
			<View className="flex-1">
				{/* Title */}
				<Text
					className={`text-sm font-bold mb-1 ${
						isDark ? "text-white" : "text-gray-800"
					}`}
				>
					{cell.cell_name}
				</Text>

				{/* Info Rows */}
				<View className="gap-0.5">
					{cell.meeting_day && cell.meeting_time && (
						<InfoRow
							icon={
								<Clock
									size={14}
									color="#999"
									strokeWidth={1.5}
								/>
							}
							value={`${cell.meeting_day}, ${cell.meeting_time}`}
						/>
					)}

					{cell.address && (
						<InfoRow
							icon={
								<MapPin
									size={14}
									color="#999"
									strokeWidth={1.5}
								/>
							}
							value={cell.address}
						/>
					)}

					{cell.cell_leader_1_name && (
						<InfoRow
							icon={
								<Users
									size={14}
									color="#999"
									strokeWidth={1.5}
								/>
							}
							value={cell.cell_leader_1_name}
						/>
					)}
				</View>
			</View>

			{/* Right: Action Button */}
			<View className="justify-center">
				<ActionButton
					label={hasJoinedAnyCells ? "View Details" : "Join Cell"}
					onPress={hasJoinedAnyCells ? handleViewDetails : handleJoinPress}
					variant={hasJoinedAnyCells ? "ghost" : "outline"}
					size="sm"
				/>
			</View>
		</View>
	);
};
