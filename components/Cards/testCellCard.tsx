import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Cell } from "@/services/Cell/cell.types";
import { useRouter } from "expo-router";
import { Clock, MapPin, Users, ChevronRight } from "lucide-react-native";
import { Avatar } from "./Avatar";
import { InfoRow } from "./InfoRow";

type TestCellCardProps = {
	cell: Cell;
};

/**
 * TestCellCard: Card component for displaying user's own cells
 * Features same styling as CardCellGroup but with navigation behavior
 *
 * @example
 * <TestCellCard cell={cell} />
 */
export const TestCellCard: React.FC<TestCellCardProps> = ({ cell }) => {
	const { isDark } = useThemeColors();
	const router = useRouter();

	const handlePress = () => {
		router.push({
			pathname: "/(app)/cells/profile/[id]",
			params: { id: cell.id! },
		});
	};

	return (
		<TouchableOpacity
			onPress={handlePress}
			activeOpacity={0.8}
			className={`rounded-2xl p-3 mb-3 flex-row gap-3 ${
				isDark
					? "bg-slate-800 border border-slate-700"
					: "bg-white border border-gray-200"
			}`}
			style={{ shadowColor: "#000", elevation: 2 }}
		>
			{/* Left: Avatar */}
			<Avatar
				initials={cell.cell_name?.charAt(0) ?? "?"}
				size="md"
			/>

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

			{/* Right: Chevron */}
			<View className="justify-center">
				<ChevronRight size={24} color="#999" />
			</View>
		</TouchableOpacity>
	);
};
