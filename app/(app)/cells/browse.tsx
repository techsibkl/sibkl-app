"use client";

import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { TestCellCard } from "@/components/Cards/testCellCard";
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
} from "react-native";

const BrowseCellsScreen = () => {
	const { isDark } = useThemeColors();
	const { user } = useAuthStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [joinedCells, setJoinedCells] = useState<number[]>([]);

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

	const renderCellCard = ({ item: cell }: { item: Cell }) => (
		<TestCellCard 
			cell={cell} 
			hasJoinedAnyCells={hasJoinedAnyCells}
			onJoin={handleJoinCell}
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
		</SharedBody>
	);
};

export default BrowseCellsScreen;
