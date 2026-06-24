"use client";

import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { TestCellCard } from "@/components/Cards/testCellCard";
import CellDetailModal from "@/components/shared/CellDetailModal";
import { useCellsQuery } from "@/hooks/Cell/useCellQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Cell } from "@/services/Cell/cell.types";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { useAuthStore } from "@/stores/authStore";
import React, { useState, useEffect, useRef } from "react";
import {
	FlatList,
	StatusBar,
	Text,
	View,
	ScrollView,
	Pressable,
	StyleSheet,
	Animated,
} from "react-native";
import { MapPin, Clock, Users } from "lucide-react-native";

const BrowseCellsScreen = () => {
	const { isDark } = useThemeColors();
	const { user } = useAuthStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [browseTab, setBrowseTab] = useState<"available" | "joined">("available");
	const [joinedCells, setJoinedCells] = useState<number[]>([]);
	const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const underlinePosition = useRef(new Animated.Value(0)).current;

	// Fetch all available cells
	const { data: availableCells = [], isPending: cellsLoading } = useCellsQuery();

	// Fetch user's current person data
	const { data: person } = useSinglePersonQuery(user?.person?.id ?? -1);

	// Get leader cell IDs
	const ledCells: number[] | undefined = person?.leader_of_cell_ids;

	// Get user's current cell IDs
	const userCellIds = (person?.cells ?? []).map((cell) => cell.id);

	// Available cells (not joined yet)
	const availableCellsFiltered = (availableCells ?? [])
		.filter((cell: Cell) => !userCellIds?.includes(cell.id))
		.filter((cell: Cell) =>
			cell?.cell_name
				?.toLowerCase()
				.includes(searchQuery.toLowerCase())
		);

	// Joined cells
	const joinedCellsList = (person?.cells ?? [])
		.filter((cell: Cell) =>
			cell?.cell_name
				?.toLowerCase()
				.includes(searchQuery.toLowerCase())
		);

	const filteredCells = browseTab === "available" ? availableCellsFiltered : joinedCellsList;

	useEffect(() => {
		Animated.timing(underlinePosition, {
			toValue: browseTab === "available" ? 0 : 1,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [browseTab]);

	const hasJoinedAnyCells = joinedCells.length > 0 || userCellIds.length > 0;

	const handleJoinCell = (cellId: number) => {
		setJoinedCells([...joinedCells, cellId]);
	};

	const handleViewDetails = (cell: Cell) => {
		setSelectedCell(cell);
		setModalVisible(true);
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

		{/* Premium Tab Navigation */}
		<View style={styles.tabWrapper}>
			<View style={styles.tabContainer}>
				<Pressable 
					onPress={() => setBrowseTab("available")}
					style={[styles.tab, browseTab === "available" && styles.tabActive]}
				>
					<Text style={[styles.tabText, browseTab === "available" && styles.tabTextActive]}>
						All
					</Text>
				</Pressable>
				<Pressable 
					onPress={() => setBrowseTab("joined")}
					style={[styles.tab, browseTab === "joined" && styles.tabActive]}
				>
					<Text style={[styles.tabText, browseTab === "joined" && styles.tabTextActive]}>
						My Cells
					</Text>
				</Pressable>
			</View>
			<Animated.View 
				style={[
					styles.underline,
					browseTab === "available" ? { marginLeft: 16 } : { marginRight: 16 },
					{
						transform: [{
							translateX: underlinePosition.interpolate({
								inputRange: [0, 1],
								outputRange: [0, 200],
							})
						}]
					}
				]} 
			/>
		</View>

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

	<CellDetailModal
		visible={modalVisible}
		onClose={() => setModalVisible(false)}
		cell={selectedCell}
		isJoined={browseTab === "joined" || userCellIds?.includes(selectedCell?.id as any)}
		isLeader={selectedCell?.id ? ledCells?.map(Number).includes(Number(selectedCell.id)) : false}
		onManage={() => {
			// Navigate to cell management screen
			// You can update this path based on your routing structure
			console.log("Manage cell:", selectedCell?.id);
		}}
	/>
		</SharedBody>
	);
};

const styles = StyleSheet.create({
	tabWrapper: {
		borderBottomWidth: 1,
		borderBottomColor: "#f3f4f6",
	},
	tabContainer: {
		flexDirection: "row",
		paddingHorizontal: 16,
		paddingVertical: 0,
	},
	tab: {
		flex: 1,
		paddingVertical: 16,
		paddingHorizontal: 12,
		alignItems: "center",
	},
	tabActive: {
		opacity: 1,
	},
	tabText: {
		fontSize: 15,
		fontWeight: "500",
		color: "#9ca3af",
		letterSpacing: -0.3,
	},
	tabTextActive: {
		color: "#1f2937",
		fontWeight: "600",
	},
	underline: {
		height: 3,
		width: "45%",
		backgroundColor: "#d6361e",
		borderRadius: 1.5,
	},
});

export default BrowseCellsScreen;
