"use client";

import { TestCellCard } from "@/components/Cards/testCellCard";
import CellCard from "@/components/Cells/CellCard";
import CellDetailModal from "@/components/shared/CellDetailModal";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useCellsPublicQuery} from "@/hooks/Cell/useCellQuery";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { joinCell } from "@/services/Cell/cell.service";
import { Cell } from "@/services/Cell/cell.types";
import { useAuthStore } from "@/stores/authStore";
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
	console.log("🔍 DEBUG - User Cell IDs:", userCellIds);
	console.log("🔍 DEBUG - Person cells:", person?.cells?.map((c:any)=>({id:c.id,name:c.cell_name})));
	
	// #region agent log
	fetch('http://127.0.0.1:7460/ingest/c9fb6a50-b73e-4ab7-9013-777157bab826',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'247e04'},body:JSON.stringify({sessionId:'247e04',location:'index.tsx:42',message:'Data loaded',data:{availableCellsCount:availableCells?.length,userCellIdsCount:userCellIds.length,personCellsCount:person?.cells?.length,browseTab},timestamp:Date.now(),runId:'debug1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
	// #endregion
	
	// Available cells (not joined yet)
	// #region agent log
	console.log("📦 All Available Cells from API:", availableCells?.map((c:any)=>({id:c.id,name:c.cell_name})));
	fetch('http://127.0.0.1:7460/ingest/c9fb6a50-b73e-4ab7-9013-777157bab826',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'247e04'},body:JSON.stringify({sessionId:'247e04',location:'index.tsx:49',message:'Available cells before filter',data:{availableCells:availableCells?.map((c:any)=>({id:c.id,name:c.cell_name})),userCellIds,availableCellsCount:availableCells?.length},timestamp:Date.now(),runId:'debug1',hypothesisId:'A,B'})}).catch(()=>{});
	// #endregion
	
	const availableCellsFiltered = (availableCells ?? [])
		.filter((cell: Cell) => !userCellIds?.includes(cell.id))
		.filter((cell: Cell) =>
			cell?.cell_name
				?.toLowerCase()
				.includes(searchQuery.toLowerCase())
		);

	console.log("✅ Cells AFTER filtering (not joined):", availableCellsFiltered?.map((c:any)=>({id:c.id,name:c.cell_name})));
	
	// #region agent log
	fetch('http://127.0.0.1:7460/ingest/c9fb6a50-b73e-4ab7-9013-777157bab826',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'247e04'},body:JSON.stringify({sessionId:'247e04',location:'index.tsx:59',message:'Available cells after filter',data:{availableCellsFiltered:availableCellsFiltered?.map((c:any)=>({id:c.id,name:c.cell_name})),filteredCount:availableCellsFiltered.length,searchQuery},timestamp:Date.now(),runId:'debug1',hypothesisId:'A'})}).catch(()=>{});
	// #endregion

	// Joined cells
	const joinedCellsList = (person?.cells ?? [])
		.filter((cell: Cell) =>
			cell?.cell_name
				?.toLowerCase()
				.includes(searchQuery.toLowerCase())
		);

	console.log("👤 Your Joined Cells:", joinedCellsList?.map((c:any)=>({id:c.id,name:c.cell_name})));

	const filteredCells = browseTab === "available" ? availableCellsFiltered : joinedCellsList;
	console.log(`📋 Current Tab: "${browseTab}" | Showing ${filteredCells.length} cells`);
	
	// #region agent log
	fetch('http://127.0.0.1:7460/ingest/c9fb6a50-b73e-4ab7-9013-777157bab826',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'247e04'},body:JSON.stringify({sessionId:'247e04',location:'index.tsx:60',message:'Filtered cells',data:{availableCellsFilteredCount:availableCellsFiltered.length,joinedCellsListCount:joinedCellsList.length,filteredCellsCount:filteredCells.length,browseTab,cellsLoading},timestamp:Date.now(),runId:'debug1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
	// #endregion

	useEffect(() => {
		Animated.timing(underlinePosition, {
			toValue: browseTab === "available" ? 0 : 1,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [browseTab]);

	const hasJoinedAnyCells = joinedCells.length > 0 || userCellIds.length > 0;

	const handleJoinCell = async (cellId: number) => {
		try {
		  await joinCell(cellId);
		  // Optionally update local state for immediate UI feedback
		  setJoinedCells([...joinedCells, cellId]);
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
				<TestCellCard 
					cell={cell} 
					hasJoinedAnyCells={hasJoinedAnyCells}
					onJoin={handleJoinCell}
					onViewDetails={handleViewDetails}
				/>
			);
		}
		return <CellCard cell={cell} />;
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

export default CellsScreen;
