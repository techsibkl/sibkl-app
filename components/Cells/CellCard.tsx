import { Cell } from "@/services/Cell/cell.types";
import { useRouter } from "expo-router";
import { ChevronRight, Clock, MapPin, Users } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ActionButton } from "../Cards/ActionButton";
import { Avatar } from "../Cards/Avatar";
import { InfoRow } from "../Cards/InfoRow";

type CellCardProps = {
	cell: Cell;
};

const MyCellCard = ({ cell }: CellCardProps) => {
	const router = useRouter();

	return (
		<TouchableOpacity
			className="rounded-2xl p-5 mb-4 bg-white"
			style={{
				shadowRadius: 5,
				shadowOpacity: 0.05,
			}}
			onPress={() => router.push({
				pathname: "/(app)/cells/profile/[id]",
				params: { id: cell.id! }
			})}
			activeOpacity={0.8}
		>
			<View className=" flex-row">
				<View className="flex-1 space-y-3">
					<View className="flex-row items-center justify-center flex-1 ">
						<View className="w-12 h-12 rounded-full justify-center items-center mr-4 bg-primary-500">
							<Users size={24} color="white" />
						</View>
						<View className="flex-1">
							<Text className="text-lg font-semibold text-text mb-1">
								{cell.cell_name}
							</Text>
							<Text className="text-xs text-text-secondary">
								Leader: {cell.cell_leader_1_name}
							</Text>
						</View>
					</View>
				</View>
				<View className="items-center justify-center">
					<TouchableOpacity className="w-10 h-10 rounded-full bg-white/30 justify-center items-center border border-white/20 border-dashed flex">
						<ChevronRight size={24} color="#666" />
					</TouchableOpacity>
				</View>
			</View>
		</TouchableOpacity>
	);
};

type AllCellCardProps = {
	cell: Cell;
	hasJoinedAnyCells?: boolean;
	onJoin?: (cellId: number) => void;
	onViewDetails?: (cell: Cell) => void;
};

/**
 * AllCellCard: Card component for displaying cells
 * Features same styling as CardCellGroup with action button
 *
 * @example
 * <AllCellCard cell={cell} hasJoinedAnyCells={false} onJoin={handleJoin} />
 */
export const AllCellCard: React.FC<AllCellCardProps> = ({ 
	cell, 
	hasJoinedAnyCells = false,
	onJoin,
	onViewDetails
}) => {
	const router = useRouter();

	const handleJoinPress = () => {
		if (onViewDetails) {
			onViewDetails(cell);
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
			className={`rounded-2xl p-3 mb-3 flex-row gap-3 bg-white border border-gray-200`}
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
				className="text-sm font-bold mb-1 text-gray-800"
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
					onPress={handleJoinPress}
					variant="ghost"
					size="sm"
				/>
			</View>
		</View>
	);
};

export default MyCellCard;
