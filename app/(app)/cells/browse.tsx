"use client";

import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { TestCellCard } from "@/components/Cards/testCellCard";
import SharedModal from "@/components/shared/SharedModal";
import { useCellsQuery } from "@/hooks/Cell/useCellQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Cell } from "@/services/Cell/cell.types";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { useAuthStore } from "@/stores/authStore";
import React, { useState } from "react";
import {
	FlatList,
	StatusBar,
	Text,
	View,
	ScrollView,
} from "react-native";
import { MapPin, Clock, Users } from "lucide-react-native";

const BrowseCellsScreen = () => {
	const { isDark } = useThemeColors();
	const { user } = useAuthStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [joinedCells, setJoinedCells] = useState<number[]>([]);
	const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
	const [modalVisible, setModalVisible] = useState(false);

	// Fetch all available cells
	const { data: availableCells = [], isPending: cellsLoading } = useCellsQuery();

	// Fetch user's current person data
	const { data: person } = useSinglePersonQuery(user?.person?.id ?? -1);

	// Get user's current cell IDs
	const userCellIds = (person?.cells ?? []).map((cell) => cell.id);

	// Filter cells based on search query and exclude already joined
	const filteredCells = (availableCells ?? [])
		.filter((cell: Cell) => !userCellIds?.includes(cell.id))
		.filter((cell: Cell) =>
			cell?.cell_name
				?.toLowerCase()
				.includes(searchQuery.toLowerCase())
		);

	const hasJoinedAnyCells = joinedCells.length > 0 || userCellIds.length > 0;

	const handleJoinCell = (cellId: number) => {
		setJoinedCells([...joinedCells, cellId]);
	};

	const handleViewDetails = (cell: Cell) => {
		console.log("1. View Details pressed for:", cell.cell_name);
		setSelectedCell(cell);
		console.log("3. Selected cell state set");
		setModalVisible(true);
		console.log("✓ Modal visible set to true");
	};

	const renderCellCard = ({ item: cell }: { item: Cell }) => (
		<TestCellCard 
			cell={cell} 
			hasJoinedAnyCells={hasJoinedAnyCells}
			onJoin={handleJoinCell}
			onViewDetails={handleViewDetails}
		/>
	);

	if (!user)
		return (
			<SharedBody>
				<Text>Unauthenticated</Text>
			</SharedBody>
		);

	return (
		<SharedBody>
			<StatusBar
				barStyle={isDark ? "light-content" : "dark-content"}
			/>

			<SharedSearchBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				placeholder="Search groups..."
			/>

			{/* Content */}
			<View className="flex-1">
				{cellsLoading ? (
					<View className="flex-1 items-center justify-center">
						<Text className="text-gray-500">Loading groups...</Text>
					</View>
				) : filteredCells.length === 0 ? (
					<View className="flex-1 items-center justify-center px-6">
						<Text className="text-center text-gray-500">
							{searchQuery
								? "No groups found matching your search"
								: "No available groups to join"}
						</Text>
					</View>
				) : (
					<FlatList
						data={filteredCells}
						keyExtractor={(item) => String(item.id)}
						renderItem={renderCellCard}
						scrollEnabled={true}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
					/>
				)}
			</View>

			<SharedModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			>
				{selectedCell && (
					<ScrollView showsVerticalScrollIndicator={false} className="p-6">
						{/* Header */}
						<Text className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
							{selectedCell.cell_name}
						</Text>

						{/* Description */}
						{selectedCell.cell_description && (
							<View className="mb-6">
								<Text className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
									About
								</Text>
								<Text className={`text-base ${isDark ? "text-gray-200" : "text-gray-700"}`}>
									{selectedCell.cell_description}
								</Text>
							</View>
						)}

						{/* Meeting Schedule */}
						<View className="mb-6 border-t border-gray-300 pt-6">
							<Text className={`text-sm font-semibold mb-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
								Meeting Schedule
							</Text>
							{selectedCell.meeting_day && selectedCell.meeting_time && (
								<View className="flex-row items-center mb-3">
									<Clock size={18} color="#666" strokeWidth={1.5} />
									<Text className={`ml-3 text-base ${isDark ? "text-gray-200" : "text-gray-700"}`}>
										{selectedCell.meeting_day}, {selectedCell.meeting_time}
									</Text>
								</View>
							)}
							{selectedCell.frequency && (
								<Text className={`ml-6 text-base ${isDark ? "text-gray-200" : "text-gray-700"}`}>
									{selectedCell.frequency}
								</Text>
							)}
						</View>

						{/* Location */}
						{selectedCell.address && (
							<View className="mb-6 border-t border-gray-300 pt-6">
								<Text className={`text-sm font-semibold mb-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
									Location
								</Text>
								<View className="flex-row items-start">
									<MapPin size={18} color="#666" strokeWidth={1.5} />
									<Text className={`ml-3 text-base flex-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
										{selectedCell.address}
									</Text>
								</View>
							</View>
						)}

						{/* Leaders */}
						<View className="mb-6 border-t border-gray-300 pt-6">
							<Text className={`text-sm font-semibold mb-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
								Leaders
							</Text>
							{selectedCell.cell_leader_1_name && (
								<Text className={`text-base mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
									{selectedCell.cell_leader_1_name}
								</Text>
							)}
							{selectedCell.cell_leader_2_name && (
								<Text className={`text-base ${isDark ? "text-gray-200" : "text-gray-700"}`}>
									{selectedCell.cell_leader_2_name}
								</Text>
							)}
						</View>
					</ScrollView>
				)}
			</SharedModal>
		</SharedBody>
	);
};

export default BrowseCellsScreen;
