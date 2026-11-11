"use client";

import MyCellCard, { AllCellCard } from "@/components/Cells/CellCard";
import CellDetailModal from "@/components/shared/CellDetailModal";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useCellsPublicQuery, useCellsQuery } from "@/hooks/Cell/useCellQuery";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { joinCell } from "@/services/Cell/cell.service";
import { Cell, CellStatus } from "@/services/Cell/cell.types";
import { useAuthStore } from "@/stores/authStore";
import { Role } from "@/utils/casl/defineAbilityFor";
import { myToast } from "@/utils/helper";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import {
	Animated,
	Pressable,
	RefreshControl,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Toast from "react-native-toast-message";

const CellsScreen = () => {
	const queryClient = useQueryClient();
	const { isDark } = useThemeColors();
	const { user } = useAuthStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [browseTab, setBrowseTab] = useState<
		"available" | "joined" | "district"
	>("joined");
	const [joinedCells, setJoinedCells] = useState<number[]>([]);
	const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [joiningCellId, setJoiningCellId] = useState<number | null>(null);
	const [pendingCellIds, setPendingCellIds] = useState<number[]>([]);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const underlinePosition = useRef(new Animated.Value(0)).current;

	// Fetch all available cells
	const {
		data: availableCells = [],
		isPending: cellsLoading,
		refetch: refetchAvailableCells,
	} = useCellsPublicQuery();

	// Fetch user's current person data
	const { data: person, refetch: refetchPerson } = useSinglePersonQuery(
		user?.person?.id ?? -1,
	);
	const profile = person ?? user?.person;
	const overseenDistrictIds = Array.from(
		new Set(
			[
				...(profile?.pastor_district_ids ?? []),
				...(profile?.admin_district_ids ?? []),
			]
				.map(Number)
				.filter((id) => Number.isFinite(id)),
		),
	);
	const showDistrictTab =
		(profile?.roles?.includes(Role.DISTRICT_PASTOR) ||
			profile?.roles?.includes(Role.DISTRICT_ADMIN)) &&
		overseenDistrictIds.length > 0;
	const {
		data: overseenCells = [],
		isLoading: districtCellsLoading,
		isError: districtCellsError,
		refetch: refetchDistrictCells,
	} = useCellsQuery({ enabled: showDistrictTab });
	// Get leader cell IDs
	const ledCells: number[] | undefined = person?.leader_of_cell_ids;
	// Active (approved) cell IDs — PENDING cells excluded so they remain
	// visible in the "All" list with a Pending badge after a join request.
	// member_status comes from cell_members.status via the person query.
	const activeCellIds = (person?.cells ?? [])
		.filter((c) => c.member_status === "ACTIVE")
		.map((c) => c.id as number);

	// PENDING membership IDs persisted in the BE (survives navigation / cold start)
	const pendingCellIdsFromPerson = (person?.cells ?? [])
		.filter((c) => c.member_status === "PENDING")
		.map((c) => c.id as number);

	// Effective pending set: session-local (optimistic) + persisted BE state
	const allPendingCellIds = Array.from(
		new Set([...pendingCellIds, ...pendingCellIdsFromPerson]),
	);

	// Joined cell IDs for "My Cells" tab and button label derivation
	const userCellIds = (person?.cells ?? []).map((cell) => cell.id);

	// Deduplicate Available Cells
	const uniqueAvailableCells = Array.from(
		new Map((availableCells ?? []).map((cell) => [cell.id, cell])).values(),
	);

	const cellStatusById = new Map<number, Cell["status"]>();
	for (const cell of [...uniqueAvailableCells, ...overseenCells]) {
		if (cell.id == null || !cell.status) continue;
		cellStatusById.set(Number(cell.id), cell.status);
	}
	const isActiveCell = (cell: Cell) => {
		const status =
			cell.status ??
			(cell.id != null ? cellStatusById.get(Number(cell.id)) : undefined);
		return !status || status === CellStatus.ACTIVE;
	};

	const availableCellsFiltered = uniqueAvailableCells
		.filter((cell: Cell) => cell.status === CellStatus.ACTIVE)
		.filter((cell: Cell) => !activeCellIds.includes(cell.id as number))
		.filter((cell: Cell) =>
			cell?.cell_name?.toLowerCase().includes(searchQuery.toLowerCase()),
		);

	// My Cells is approved membership only. PENDING stays on All with a badge.
	const uniqueJoinedCells = Array.from(
		new Map(
			(person?.cells ?? [])
				.filter((cell) => cell.member_status === "ACTIVE")
				.map((cell) => [cell.id, cell]),
		).values(),
	);

	const joinedCellsList = uniqueJoinedCells
		.filter(isActiveCell)
		.filter((cell: Cell) =>
			cell?.cell_name?.toLowerCase().includes(searchQuery.toLowerCase()),
		);

	const districtIdSet = new Set(overseenDistrictIds);
	const districtCellsList = Array.from(
		new Map(
			overseenCells
				.filter(
					(cell) =>
						cell.status === CellStatus.ACTIVE &&
						cell.district_id != null &&
						districtIdSet.has(Number(cell.district_id)),
				)
				.map((cell) => [cell.id, cell]),
		).values(),
	).filter((cell: Cell) =>
		cell?.cell_name?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const filteredCells =
		browseTab === "available"
			? availableCellsFiltered
			: browseTab === "district"
				? districtCellsList
				: joinedCellsList;

	useEffect(() => {
		if (userCellIds.length === 0) {
			setBrowseTab("available");
		} else {
			setBrowseTab("joined");
		}
	}, []); // Empty dependency array - runs only once on mount

	useEffect(() => {
		if (!showDistrictTab && browseTab === "district") {
			setBrowseTab("joined");
		}
	}, [showDistrictTab, browseTab]);

	useEffect(() => {
		Animated.timing(underlinePosition, {
			toValue:
				browseTab === "available" ? 0 : browseTab === "joined" ? 1 : 2,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [browseTab]);

	// Smart routing: Set initial tab based on whether user has cells

	const hasJoinedAnyCells = joinedCells.length > 0 || userCellIds.length > 0;

	const handleJoinCell = async (cellId: number) => {
		try {
			setJoiningCellId(cellId);
			await joinCell(cellId);
			setPendingCellIds((prev) =>
				prev.includes(cellId) ? prev : [...prev, cellId],
			);
			await queryClient.invalidateQueries({
				queryKey: ["people", user?.person?.id],
			});

			// Show toast notification
			const cellName = availableCells.find(
				(c) => c.id === cellId,
			)?.cell_name;
			Toast.show(
				myToast({
					success: true,
					message: `Join request sent to ${cellName}`,
				}),
			);
		} catch (error) {
			console.error("Failed to join cell:", error);
			Toast.show(
				myToast({
					success: false,
					message: "Failed to send join request",
				}),
			);
		} finally {
			setJoiningCellId(null);
		}
	};

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			await Promise.all([
				refetchAvailableCells(),
				refetchPerson(),
				showDistrictTab ? refetchDistrictCells() : Promise.resolve(),
			]);
		} catch (err) {
			console.error("Refresh error:", err);
		} finally {
			setIsRefreshing(false);
		}
	};

	const selectedCellId = selectedCell?.id;
	const isSelectedCellPending = Boolean(
		selectedCellId && allPendingCellIds.includes(selectedCellId as number),
	);
	const isSelectedCellJoined =
		!isSelectedCellPending &&
		(browseTab === "joined" ||
			Boolean(userCellIds?.includes(selectedCellId as number)));

	const handleViewDetails = (cell: Cell) => {
		setSelectedCell(cell);
		setModalVisible(true);
	};

	const renderCellCard = ({ item: cell }: { item: Cell }) => {
		if (browseTab === "available") {
			const cellIsPending = allPendingCellIds.includes(cell.id as number);
			return (
				<AllCellCard
					cell={cell}
					hasJoinedAnyCells={hasJoinedAnyCells}
					isPending={cellIsPending}
					onViewDetails={handleViewDetails}
				/>
			);
		}
		if (browseTab === "district") {
			return (
				<MyCellCard
					cell={cell}
					detail={cell.district_name ?? undefined}
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
			<StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

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
						style={[
							styles.tab,
							browseTab === "available" && styles.tabActive,
							showDistrictTab &&
								browseTab === "available" &&
								styles.tabActiveBorder,
						]}
					>
						<Text
							style={[
								styles.tabText,
								browseTab === "available" &&
									styles.tabTextActive,
							]}
						>
							All
						</Text>
					</Pressable>
					<Pressable
						onPress={() => setBrowseTab("joined")}
						style={[
							styles.tab,
							browseTab === "joined" && styles.tabActive,
							showDistrictTab &&
								browseTab === "joined" &&
								styles.tabActiveBorder,
						]}
					>
						<Text
							style={[
								styles.tabText,
								browseTab === "joined" && styles.tabTextActive,
							]}
						>
							My Cells
						</Text>
					</Pressable>
					{showDistrictTab ? (
						<Pressable
							onPress={() => setBrowseTab("district")}
							style={[
								styles.tab,
								browseTab === "district" && styles.tabActive,
								browseTab === "district" &&
									styles.tabActiveBorder,
							]}
						>
							<Text
								style={[
									styles.tabText,
									browseTab === "district" &&
										styles.tabTextActive,
								]}
							>
								District
							</Text>
						</Pressable>
					) : null}
				</View>
				{showDistrictTab ? null : (
					<Animated.View
						style={[
							styles.underline,
							browseTab === "available"
								? { marginLeft: 16 }
								: { marginRight: 16 },
							{
								transform: [
									{
										translateX:
											underlinePosition.interpolate({
												inputRange: [0, 1],
												outputRange: [0, 200],
											}),
									},
								],
							},
						]}
					/>
				)}
			</View>

			{/* Content */}
			<View className="flex-1">
				{(browseTab === "district"
					? districtCellsLoading
					: cellsLoading) ? (
					<View className="flex-1 items-center justify-center">
						<Text className="text-gray-500">Loading groups...</Text>
					</View>
				) : browseTab === "district" && districtCellsError ? (
					<View className="flex-1 items-center justify-center px-6">
						<Text className="text-center text-gray-500">
							Couldn't load district cells
						</Text>
					</View>
				) : browseTab === "district" && districtCellsList.length === 0 ? (
					<View className="flex-1 items-center justify-center px-6">
						<Text className="text-center text-gray-500 text-lg mb-4">
							No Cells
						</Text>
						<Text className="text-center text-gray-400">
							{searchQuery
								? "No groups found matching your search"
								: "No cells in your district"}
						</Text>
					</View>
				) : browseTab === "joined" &&
				  joinedCellsList.length === 0 &&
				  !searchQuery ? (
					<View className="flex-1 items-center justify-center px-6">
						<Text className="text-center text-gray-500 text-lg mb-4">
							No Cells
						</Text>
						<Text className="text-center text-gray-400 mb-6">
							You haven't joined any groups yet
						</Text>
						<Pressable
							onPress={() => setBrowseTab("available")}
							style={styles.joinButton}
						>
							<Text style={styles.joinButtonText}>
								Join One Now
							</Text>
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
						contentContainerStyle={{
							paddingHorizontal: 16,
							paddingVertical: 16,
						}}
						estimatedItemSize={140}
						refreshControl={
							<RefreshControl
								refreshing={isRefreshing}
								onRefresh={handleRefresh}
								colors={["#d6361e"]}
								tintColor="#d6361e"
							/>
						}
					/>
				)}
			</View>

			<CellDetailModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				cell={selectedCell}
				isJoined={isSelectedCellJoined}
				isPending={isSelectedCellPending}
				isJoining={joiningCellId === selectedCellId}
				isLeader={
					selectedCellId
						? Boolean(
								ledCells
									?.map(Number)
									.includes(Number(selectedCellId)),
							)
						: false
				}
				onJoin={handleJoinCell}
				onManage={() => {
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
	tabActiveBorder: {
		borderBottomWidth: 3,
		borderBottomColor: "#d6361e",
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
