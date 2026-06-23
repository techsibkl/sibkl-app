import React, { useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { BottomSheetModal, useBottomSheetInternal } from "@gorhom/bottom-sheet";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Cell } from "@/services/Cell/cell.types";
import { X, MapPin, Clock, Users, Phone, Info } from "lucide-react-native";

type CellDetailModalProps = {
	ref: React.Ref<BottomSheetModal>;
	cell: Cell | null;
	hasJoinedAnyCells?: boolean;
	onJoin?: (cellId: number) => void;
};

export const CellDetailModal = React.forwardRef<BottomSheetModal, CellDetailModalProps>(
	({ cell, hasJoinedAnyCells = false, onJoin }, ref) => {
		const { isDark } = useThemeColors();

		if (!cell) return null;

		const memberCount = cell.members?.length ?? 0;

		const handleJoin = () => {
			if (onJoin && cell.id) {
				onJoin(cell.id);
			}
		};

		const handleCall = (phone: string | null | undefined) => {
			if (phone) {
				Linking.openURL(`tel:${phone}`);
			}
		};

		return (
			<BottomSheetModal
				ref={ref}
				snapPoints={["50%", "90%"]}
				enablePanDownToClose
				backgroundStyle={{
					backgroundColor: isDark ? "#1f2937" : "#ffffff",
				}}
				handleIndicatorStyle={{
					backgroundColor: isDark ? "#9ca3af" : "#d1d5db",
				}}
			>
				<ScrollView
					className={`flex-1 px-6 ${isDark ? "bg-gray-900" : "bg-white"}`}
					showsVerticalScrollIndicator={false}
				>
					{/* Header */}
					<View className="flex-row items-center justify-between mb-6">
						<Text
							className={`text-2xl font-bold flex-1 ${
								isDark ? "text-white" : "text-gray-900"
							}`}
						>
							{cell.cell_name}
						</Text>
					</View>

					{/* Cell Description */}
					{cell.cell_description && (
						<View className="mb-6">
							<Text
								className={`text-sm font-semibold mb-2 ${
									isDark ? "text-gray-300" : "text-gray-600"
								}`}
							>
								About
							</Text>
							<Text
								className={`text-base leading-6 ${
									isDark ? "text-gray-200" : "text-gray-700"
								}`}
							>
								{cell.cell_description}
							</Text>
						</View>
					)}

					{/* Meeting Info */}
					<View className="mb-6 border-t border-gray-300 dark:border-gray-700 pt-6">
						<Text
							className={`text-sm font-semibold mb-3 ${
								isDark ? "text-gray-300" : "text-gray-600"
							}`}
						>
							Meeting Schedule
						</Text>

						{(cell.meeting_day || cell.meeting_time) && (
							<View className="flex-row items-center mb-3">
								<Clock
									size={18}
									color={isDark ? "#9ca3af" : "#666"}
									strokeWidth={1.5}
								/>
								<Text
									className={`ml-3 text-base ${
										isDark ? "text-gray-200" : "text-gray-700"
									}`}
								>
									{cell.meeting_day && cell.meeting_time
										? `${cell.meeting_day}, ${cell.meeting_time}`
										: cell.meeting_day || cell.meeting_time}
								</Text>
							</View>
						)}

						{cell.frequency && (
							<View className="flex-row items-center mb-3">
								<Info
									size={18}
									color={isDark ? "#9ca3af" : "#666"}
									strokeWidth={1.5}
								/>
								<Text
									className={`ml-3 text-base ${
										isDark ? "text-gray-200" : "text-gray-700"
									}`}
								>
									{cell.frequency}
								</Text>
							</View>
						)}
					</View>

					{/* Location */}
					{cell.address && (
						<View className="mb-6 border-t border-gray-300 dark:border-gray-700 pt-6">
							<Text
								className={`text-sm font-semibold mb-3 ${
									isDark ? "text-gray-300" : "text-gray-600"
								}`}
							>
								Location
							</Text>
							<View className="flex-row items-start">
								<MapPin
									size={18}
									color={isDark ? "#9ca3af" : "#666"}
									strokeWidth={1.5}
									style={{ marginTop: 2 }}
								/>
								<Text
									className={`ml-3 text-base flex-1 ${
										isDark ? "text-gray-200" : "text-gray-700"
									}`}
								>
									{cell.address}
								</Text>
							</View>
						</View>
					)}

					{/* Age Range */}
					{cell.age_range && (
						<View className="mb-6 border-t border-gray-300 dark:border-gray-700 pt-6">
							<Text
								className={`text-sm font-semibold mb-3 ${
									isDark ? "text-gray-300" : "text-gray-600"
								}`}
							>
								Age Group
							</Text>
							<Text
								className={`text-base ${
									isDark ? "text-gray-200" : "text-gray-700"
								}`}
							>
								{cell.age_range}
							</Text>
						</View>
					)}

					{/* Leader Info */}
					<View className="mb-6 border-t border-gray-300 dark:border-gray-700 pt-6">
						<Text
							className={`text-sm font-semibold mb-3 ${
								isDark ? "text-gray-300" : "text-gray-600"
							}`}
						>
							Leaders
						</Text>

						{cell.cell_leader_1_name && (
							<View className="mb-3">
								<View className="flex-row items-center justify-between">
									<View className="flex-row items-center flex-1">
										<Users
											size={18}
											color={isDark ? "#9ca3af" : "#666"}
											strokeWidth={1.5}
										/>
										<Text
											className={`ml-3 text-base ${
												isDark ? "text-gray-200" : "text-gray-700"
											}`}
										>
											{cell.cell_leader_1_name}
										</Text>
									</View>
									{cell.cell_leader_1_phone && (
										<TouchableOpacity
											onPress={() => handleCall(cell.cell_leader_1_phone)}
										>
											<Phone
												size={18}
												color="#007AFF"
												strokeWidth={1.5}
											/>
										</TouchableOpacity>
									)}
								</View>
							</View>
						)}

						{cell.cell_leader_2_name && (
							<View>
								<View className="flex-row items-center justify-between">
									<View className="flex-row items-center flex-1">
										<Users
											size={18}
											color={isDark ? "#9ca3af" : "#666"}
											strokeWidth={1.5}
										/>
										<Text
											className={`ml-3 text-base ${
												isDark ? "text-gray-200" : "text-gray-700"
											}`}
										>
											{cell.cell_leader_2_name}
										</Text>
									</View>
									{cell.cell_leader_2_phone && (
										<TouchableOpacity
											onPress={() => handleCall(cell.cell_leader_2_phone)}
										>
											<Phone
												size={18}
												color="#007AFF"
												strokeWidth={1.5}
											/>
										</TouchableOpacity>
									)}
								</View>
							</View>
						)}
					</View>

					{/* Members */}
					{memberCount > 0 && (
						<View className="mb-6 border-t border-gray-300 dark:border-gray-700 pt-6">
							<Text
								className={`text-sm font-semibold mb-3 ${
									isDark ? "text-gray-300" : "text-gray-600"
								}`}
							>
								Members ({memberCount})
							</Text>
							{cell.members?.slice(0, 5).map((member, idx) => (
								<Text
									key={idx}
									className={`text-base mb-2 ${
										isDark ? "text-gray-200" : "text-gray-700"
									}`}
								>
									• {member.full_name}
								</Text>
							))}
							{memberCount > 5 && (
								<Text
									className={`text-sm italic ${
										isDark ? "text-gray-400" : "text-gray-500"
									}`}
								>
									+{memberCount - 5} more
								</Text>
							)}
						</View>
					)}

					{/* Additional Info */}
					{cell.cell_character && (
						<View className="mb-6 border-t border-gray-300 dark:border-gray-700 pt-6">
							<Text
								className={`text-sm font-semibold mb-2 ${
									isDark ? "text-gray-300" : "text-gray-600"
								}`}
							>
								Character
							</Text>
							<Text
								className={`text-base ${
									isDark ? "text-gray-200" : "text-gray-700"
								}`}
							>
								{cell.cell_character}
							</Text>
						</View>
					)}

					{/* Action Button */}
					<View className="mb-8 border-t border-gray-300 dark:border-gray-700 pt-6">
						{!hasJoinedAnyCells ? (
							<TouchableOpacity
								onPress={handleJoin}
								className="bg-blue-500 rounded-lg py-4 items-center"
							>
								<Text className="text-white font-semibold text-base">
									Join Cell
								</Text>
							</TouchableOpacity>
						) : (
							<View className="bg-blue-100/30 rounded-lg py-4 items-center">
								<Text className="text-blue-600 font-semibold text-base">
									✓ Already a Member
								</Text>
							</View>
						)}
					</View>
				</ScrollView>
			</BottomSheetModal>
		);
	}
);

CellDetailModal.displayName = "CellDetailModal";
