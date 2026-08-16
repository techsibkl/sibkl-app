"use client";

import EmptyList from "@/components/Announcement/EmptyList";
import AttendanceTabContent from "@/components/Cells/Attendance/AttendanceTabContent";
import CreateSessionSheet from "@/components/Cells/CreateSessionSheet";
import AddMembersSheet from "@/components/Cells/Profile/AddMembersSheet";
import MembersList from "@/components/Cells/Profile/MembersList";
import SearchMembersModal from "@/components/Cells/Profile/SearchMembersModal";
import SharedBody from "@/components/shared/SharedBody";
import SkeletonCellProfile from "@/components/shared/Skeleton/SkeletonCellProfile";
import { featureFlags } from "@/config/featureFlags";
// import { getFabActions } from "@/constants/cont_cells";
import { useSingleCellQuery } from "@/hooks/Cell/useSingleCellQuery";
import {
	useCellAttendanceStatsQuery,
	useCellSessionsQuery,
	usePersonCellAttendanceStatsQuery,
	usePersonSessionAttendanceQuery,
} from "@/hooks/CellAttendance/useCellAttendanceQuery";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import {
	removeCellMembers,
	updateMemberStatus,
} from "@/services/Cell/cell.service";
import { Person } from "@/services/Person/person.type";
import { useAuthStore } from "@/stores/authStore";
import { myToast } from "@/utils/helper";
import { getInitials } from "@/utils/helper_profile";
import {
	BottomSheetModal,
	BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	CalendarClockIcon,
	ScanQrCodeIcon,
	SearchIcon,
	UserPlusIcon,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
	RefreshControl,
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Portal, Provider } from "react-native-paper";
import Toast from "react-native-toast-message";

const CellProfileScreen = () => {
	const router = useRouter();
	const { isDark } = useThemeColors();
	const { id } = useLocalSearchParams();
	const { user, ability } = useAuthStore();
	const { data: person } = useSinglePersonQuery(user?.person?.id ?? -1);
	const queryClient = useQueryClient();
	// console.log("person:", person);

	const ledCells: number[] | undefined = person?.leader_of_cell_ids;
	const isLeader = ledCells?.map(Number).includes(Number(id));

	// Initialize state early so it can be used in queries
	const [activeTab, setActiveTab] = useState<
		"people" | "announcements" | "attendance"
	>("people");
	const [searchQuery, setSearchQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [memberStatuses, setMemberStatuses] = useState<
		Record<number, string>
	>({});
	const [isUpdating, setIsUpdating] = useState<number | null>(null);
	const [statusError, setStatusError] = useState<string | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const createSessionSheetModalRef = useRef<BottomSheetModal>(null);
	const searchMembersSheetRef = useRef<BottomSheetModal>(null);
	const addMembersSheetRef = useRef<BottomSheetModal>(null);

	// Only fetch from API if user is a leader
	const {
		data: cellFromApi,
		isPending,
		error: queryError,
		isError,
		refetch,
	} = useSingleCellQuery(Number(id));

	// Fetch cell sessions
	const { data: sessions = [], isPending: isSessionsPending } =
		useCellSessionsQuery(Number(id));

	// Fetch attendance stats for all members (for leaders)
	const {
		data: memberAttendanceStats = [],
		isPending: isMemberStatsPending,
	} = useCellAttendanceStatsQuery(Number(id), isLeader ?? false);

	// Fetch current user's attendance stats
	const { data: myAttendanceStats, isPending: isMyAttendanceStatsPending } =
		usePersonCellAttendanceStatsQuery(
			Number(id),
			person?.id ?? -1,
			activeTab === "attendance",
		);

	// Fetch current user's session-by-session attendance
	const {
		data: mySessionAttendance = {},
		isPending: isSessionAttendancePending,
	} = usePersonSessionAttendanceQuery(
		Number(id),
		sessions,
		person?.id ?? -1,
		activeTab === "attendance",
	);

	// Get cell data from person's cells for regular members
	// const cellFromPerson = person?.cells?.find(c => c.id === Number(id));

	// Use API data for leaders, fallback to person data for members
	const cell = cellFromApi;
	const activeCellMembers = cell?.members?.filter(
		(member: Person) => member.status === "ACTIVE",
	);

	const ledCellsFormatted = (person?.cells ?? [])
		.filter(
			(cell) =>
				cell.id && ledCells?.map(Number).includes(Number(cell.id)),
		)
		.map((cell) => ({ id: cell.id!, name: cell.cell_name! }));

	useEffect(() => {
		setOpen(false);
	}, [activeTab]);

	const cellProfileTabs = [
		"people",
		...(featureFlags.cellAttendance ? (["attendance"] as const) : []),
		"announcements",
	] as const;

	const filteredMembers = (cell?.members ?? []).filter((member: Person) =>
		member?.full_legal_name
			?.toLowerCase()
			.includes(searchQuery.toLowerCase()),
	);

	const handleAcceptMember = async (memberId: number) => {
		try {
			setIsUpdating(memberId);
			setStatusError(null);

			await updateMemberStatus(Number(id), memberId, "ACTIVE");

			setMemberStatuses((prev) => ({
				...prev,
				[memberId]: "ACTIVE",
			}));

			// Invalidate cell query to refresh member list
			queryClient.invalidateQueries({
				queryKey: ["cells", Number(id)],
			});

			// Show success toast
			const memberName = cell?.members?.find(
				(m) => m.id === memberId,
			)?.full_legal_name;
			Toast.show(
				myToast({
					success: true,
					message: `${memberName} has been accepted`,
				}),
			);
		} catch (err: any) {
			setStatusError(err.message || "Failed to accept member");
			console.error("Accept member error:", err);
			Toast.show(
				myToast({
					success: false,
					message: err.message || "Failed to accept member",
				}),
			);
		} finally {
			setIsUpdating(null);
		}
	};

	const handleOnRefresh = async () => {
		setIsRefreshing(true);
		try {
			await refetch();
			// Also invalidate related queries
			queryClient.invalidateQueries({
				queryKey: ["cell-sessions", Number(id)],
			});
		} catch (err) {
			console.error("Refresh error:", err);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleRejectMember = async (memberId: number) => {
		try {
			setIsUpdating(memberId);
			setStatusError(null);

			await updateMemberStatus(Number(id), memberId, "REJECTED");

			setMemberStatuses((prev) => ({
				...prev,
				[memberId]: "REJECTED",
			}));
		} catch (err: any) {
			setStatusError(err.message || "Failed to reject member");
			console.error("Reject member error:", err);
		} finally {
			setIsUpdating(null);
		}
	};

	// Remove member, not yet implemented
	const handleRemoveMember = async (memberId: number) => {
		try {
			console.log("Removing member with ID:", memberId);
			setIsUpdating(memberId);
			setStatusError(null);

			await removeCellMembers(Number(id), [memberId], person?.id ?? -1);

			queryClient.invalidateQueries({
				queryKey: ["people", person?.id],
			});
		} catch (err: any) {
			setStatusError(err.message || "Failed to remove member");
			console.error("Remove member error:", err);
		} finally {
			Toast.show(
				myToast({
					success: true,
					message: `${cell?.members?.find((m) => m.id === memberId)?.full_legal_name} removed from cell`,
				}),
			);
			setIsUpdating(null);
		}
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case "people":
				return (
					<View className="px-2">
						<MembersList
							members={
								isLeader
									? filteredMembers
									: filteredMembers.filter(
											(m) =>
												(memberStatuses[m.id] ||
													m.status ||
													"ACTIVE") === "ACTIVE",
										)
							}
							searchQuery={searchQuery}
							isLeader={isLeader}
							currentPersonId={person?.id}
							memberStatuses={memberStatuses}
							onAccept={handleAcceptMember}
							onReject={handleRejectMember}
							isUpdating={isUpdating}
							onRemoveMember={handleRemoveMember}
							onCoreToggled={() => refetch()}
							cellLeader1Id={cell?.cell_leader_1}
							cellLeader2Id={cell?.cell_leader_2}
						/>
					</View>
				);

			case "attendance":
				return (
					<AttendanceTabContent
						cellId={Number(id)}
						sessions={sessions}
						isLeader={isLeader ?? false}
						currentPersonId={person?.id}
						memberStats={memberAttendanceStats}
						sessionStats={
							myAttendanceStats ? [myAttendanceStats] : []
						}
						mySessionAttendance={mySessionAttendance}
						members={cell?.members ?? []}
						isLoadingSessions={isSessionsPending}
						isLoadingPersonStats={
							isMyAttendanceStatsPending ||
							isMemberStatsPending ||
							isSessionAttendancePending
						}
					/>
				);
			case "announcements":
				return <EmptyList />;
			default:
				return null;
		}
	};

	if (isPending)
		return (
			<SharedBody>
				<SkeletonCellProfile />
			</SharedBody>
		);

	if (isError && isLeader)
		return (
			<SharedBody>
				<Text>Type of Id: {typeof id}</Text>
				<Text>{queryError?.message + "ID: " + id}</Text>
				<Text>{queryError?.name}</Text>
			</SharedBody>
		);

	if (!cell)
		return (
			<SharedBody>
				<Text>Cell not found</Text>
			</SharedBody>
		);

	return (
		<SharedBody>
			<StatusBar
				className="bg-background"
				barStyle={isDark ? "light-content" : "dark-content"}
			/>
			<BottomSheetModalProvider>
				<ScrollView
					refreshControl={
						<RefreshControl
							refreshing={isRefreshing}
							onRefresh={handleOnRefresh}
							colors={["#d6361e"]}
							tintColor="#d6361e"
						/>
					}
				>
					{/* Cell info section */}
					<View className="items-center py-6">
						<View className="mb-4 w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
							<Text className="text-2xl font-bold text-text">
								{getInitials(cell.cell_name ?? "")}
							</Text>
						</View>
						<Text className="text-text text-2xl font-bold text-center mb-2">
							{cell.cell_name}
						</Text>
						<Text className="text-text-secondary text-base">
							Cell • {activeCellMembers?.length} member
							{activeCellMembers?.length === 1 ? "" : "s"}
						</Text>
					</View>

					{statusError && (
						<View className="bg-red-100 p-3 mx-3 rounded-lg mb-3">
							<Text className="text-red-700 text-sm">
								{statusError}
							</Text>
						</View>
					)}

					{/* Action Buttons */}
					<View className="flex-row justify-center gap-2 w-full max-w-[90%] mx-6 mb-6">
						{/* Scan QR - attendance (pilot) */}
						{featureFlags.cellAttendance && (
							<TouchableOpacity
								onPress={() =>
									router.push({
										pathname: "/(app)/cells/scanner",
										params: { cell_id: String(id) },
									})
								}
								className="bg-white min-w-[20%] px-4 h-20 rounded-2xl p-2 items-center justify-center flex-col gap-0.5"
							>
								<ScanQrCodeIcon size={25} color="#1e40af" />
								<Text className="text-text text-sm">Scan</Text>
							</TouchableOpacity>
						)}

						{/* Search Members - available to all */}
						<TouchableOpacity
							onPress={() =>
								searchMembersSheetRef.current?.present()
							}
							className="bg-white min-w-[20%] px-4 h-20 rounded-2xl p-2 items-center justify-center flex-col gap-0.5"
						>
							<SearchIcon size={25} color="#1e40af" />
							<Text className="text-text text-sm ">Search</Text>
						</TouchableOpacity>

						{/* View Sessions - for leaders and core only */}
						{featureFlags.cellAttendance &&
							isLeader &&
							ability.can("read", "CellSession") && (
								<TouchableOpacity
									onPress={() =>
										router.push({
											pathname: "/(app)/cells/sessions",
											params: { cell_id: String(id) },
										})
									}
									className="bg-white min-w-[20%] px-4 h-20 rounded-2xl p-2 items-center justify-center flex-col gap-0.5"
								>
									<CalendarClockIcon
										size={25}
										color="#1e40af"
									/>
									<Text className="text-text text-sm">
										Sessions
									</Text>
								</TouchableOpacity>
							)}

						{/* Add Members - for leaders and core only */}
						{isLeader && ability.can("create", "CellMembers") && (
							<TouchableOpacity
								onPress={() =>
									addMembersSheetRef.current?.present()
								}
								className="bg-white min-w-[20%] px-4 h-20 rounded-2xl p-2 items-center justify-center flex-col gap-0.5"
							>
								<UserPlusIcon size={25} color="#1e40af" />
								<Text className="text-text text-sm">Add</Text>
							</TouchableOpacity>
						)}
					</View>

					{/* Tab bar */}
					<View className="flex-row mx-6 mb-2">
						{cellProfileTabs.map((tab, index) => (
							<TouchableOpacity
								key={tab}
								className={`flex-1 py-3 ${
									index === 0
										? "rounded-l-lg border border-border"
										: index === cellProfileTabs.length - 1
											? "rounded-r-lg border border-border"
											: " border-t border-b border-border"
								} ${activeTab === tab ? "bg-background" : "bg-background-secondary"}`}
								onPress={() =>
									setActiveTab(tab as typeof activeTab)
								}
							>
								<Text
									className={`text-center text-sm text-nowrap font-medium ${
										activeTab === tab
											? "text-text"
											: "text-text-secondary"
									}`}
								>
									{tab.charAt(0).toUpperCase() + tab.slice(1)}
								</Text>
							</TouchableOpacity>
						))}
					</View>

					{renderTabContent()}
				</ScrollView>

				<Provider>
					<Portal>
						{/* <FAB.Group
							open={open}
							icon={open ? "close" : "plus"}
							color="white"
							fabStyle={{ backgroundColor: "#d6361e" }}
							backdropColor="transparent"
							visible
							style={{
								paddingBottom: 0, // Sometimes there's default padding you might want to remove
								bottom: 10, // Adjust this value to move it up or down (default is usually around 16)
								right: 16, // Adjust this to move it left or right
							}}
							actions={getFabActions({
								ability: ability,
								router: router,
								createSessionSheetModalRef:
									createSessionSheetModalRef,
								cellId: Number(id),
							})}
							onStateChange={({ open }) => setOpen(open)}
						/> */}
						<CreateSessionSheet
							ref={createSessionSheetModalRef}
							ledCells={ledCellsFormatted}
						/>

						{/* Search Members Modal */}
						<SearchMembersModal
							ref={searchMembersSheetRef}
							members={filteredMembers}
							memberStatuses={memberStatuses}
							isLeader={isLeader ?? false}
							currentPersonId={person?.id}
							isUpdating={isUpdating}
							onAccept={handleAcceptMember}
							onReject={handleRejectMember}
							onRemoveMember={handleRemoveMember}
						/>

						{/* Add Members Sheet */}
						<AddMembersSheet
							ref={addMembersSheetRef}
							cellId={Number(id)}
							currentMembers={cell?.members ?? []}
							onSuccess={() => {}}
						/>
					</Portal>
				</Provider>
			</BottomSheetModalProvider>
			<Toast />
		</SharedBody>
	);
};

export default CellProfileScreen;
