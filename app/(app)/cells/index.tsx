"use client";

import { AllCellCard } from "@/components/Cells/CellCard";
import MyCellCard from "@/components/Cells/CellCard";
import CellDetailModal from "@/components/shared/CellDetailModal";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useCellsPublicQuery } from "@/hooks/Cell/useCellQuery";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { joinCell } from "@/services/Cell/cell.service";
import { Cell } from "@/services/Cell/cell.types";
import { useAuthStore } from "@/stores/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";
import React, { useEffect, useRef, useState } from "react";
import {
	Animated,
	FlatList,
	Pressable,
	StatusBar,
	StyleSheet,
	Text,
	View
} from "react-native";

const CellsScreen = () => {
	const queryClient = useQueryClient();
	const { isDark } = useThemeColors();
	const { user } = useAuthStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [browseTab, setBrowseTab] = useState<"available" | "joined">("joined");
	const [joinedCells, setJoinedCells] = useState<number[]>([]);
	const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const underlinePosition = useRef(new Animated.Value(0)).current;

	// Fetch all available cells
	const { data: availableCells = [], isPending: cellsLoading } = useCellsPublicQuery();

	// Fetch user's current person data
	const { data: person } = useSinglePersonQuery(user?.person?.id ?? -1);
	// Get leader cell IDs
	const ledCells: number[] | undefined = person?.leader_of_cell_ids;
	// Get user's current cell IDs
	const userCellIds = (person?.cells ?? []).map((cell) => cell.id);
	console.log("Person data:", person);
	console.log("User cell IDs:", userCellIds);
	console.log("Person.cells:", person?.cells);
	
	// Deduplicate Available Cells
	const uniqueAvailableCells = Array.from(
		new Map((availableCells ?? []).map(cell => [cell.id, cell])).values()
	);

	const availableCellsFiltered = uniqueAvailableCells
		.filter((cell: Cell) => !userCellIds?.includes(cell.id))
		.filter((cell: Cell) =>
			cell?.cell_name
				?.toLowerCase()
				.includes(searchQuery.toLowerCase())
		);


	// Deduplicate Joined Cells
	const uniqueJoinedCells = Array.from(
		new Map((person?.cells ?? []).map(cell => [cell.id, cell])).values()
	);

	const joinedCellsList = uniqueJoinedCells
		.filter((cell: Cell) =>
			cell?.cell_name
				?.toLowerCase()
				.includes(searchQuery.toLowerCase())
		);

	const filteredCells = browseTab === "available" ? availableCellsFiltered : joinedCellsList;
	
	fetch('http://127.0.0.1:7460/ingest/c9fb6a50-b73e-4ab7-9013-777157bab826',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'247e04'},body:JSON.stringify({sessionId:'247e04',location:'index.tsx:60',message:'Filtered cells',data:{availableCellsFilteredCount:availableCellsFiltered.length,joinedCellsListCount:joinedCellsList.length,filteredCellsCount:filteredCells.length,browseTab,cellsLoading},timestamp:Date.now(),runId:'debug1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
	// #endregion
	useEffect(() => {
		if (userCellIds.length === 0) {
			setBrowseTab("available");
		} else {
			setBrowseTab("joined");
		}
	}, []); // Empty dependency array - runs only once on mount

	useEffect(() => {
		Animated.timing(underlinePosition, {
			toValue: browseTab === "available" ? 0 : 1,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [browseTab]);

	// Smart routing: Set initial tab based on whether user has cells

	const hasJoinedAnyCells = joinedCells.length > 0 || userCellIds.length > 0;

	const handleJoinCell = async (cellId: number) => {
		try {
		  await joinCell(cellId);
		  // Optionally update local state for immediate UI feedback
		  queryClient.invalidateQueries({ 
			queryKey: ["people", user?.person?.id] 
		  });
		  // Or refetch the person data to sync with backend
		} catch (error) {
		  console.error("Failed to join cell:", error);
		  // Show error toast to user
		}
	  };

	const handleViewDetails = (cell: Cell) => {
		setSelectedCell(cell);
		setModalVisible(true);
	};

	const renderCellCard = ({ item: cell }: { item: Cell }) => {
		if (browseTab === "available") {
			return (
				<AllCellCard 
					cell={cell} 
					hasJoinedAnyCells={hasJoinedAnyCells}
					onJoin={handleJoinCell}
					onViewDetails={handleViewDetails}
				/>
			);
		}
		return <MyCellCard cell={cell} />;
	};

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

		{/* Tab Navigation - Always Visible */}
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
				) : browseTab === "joined" && userCellIds.length === 0 ? (
					<View className="flex-1 items-center justify-center px-6">
						<Text className="text-center text-gray-500 text-lg mb-4">No Cells</Text>
						<Text className="text-center text-gray-400 mb-6">You haven't joined any groups yet</Text>
						<Pressable 
							onPress={() => setBrowseTab("available")}
							style={styles.joinButton}
						>
							<Text style={styles.joinButtonText}>Join One Now</Text>
						</Pressable>
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
				<FlashList
					data={filteredCells}
					keyExtractor={(item) => String(item.id)}
					renderItem={renderCellCard}
					scrollEnabled={true}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
					estimatedItemSize={140}
				/>
			)}
			</View>

	<CellDetailModal
		visible={modalVisible}
		onClose={() => setModalVisible(false)}
		cell={selectedCell}
		isJoined={browseTab === "joined" || Boolean(userCellIds?.includes(selectedCell?.id as any))}
		isLeader={selectedCell?.id ? Boolean(ledCells?.map(Number).includes(Number(selectedCell.id))) : false}
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
	joinButton: {
		backgroundColor: "#d6361e",
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
	},
	joinButtonText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
});

export default CellsScreen;
