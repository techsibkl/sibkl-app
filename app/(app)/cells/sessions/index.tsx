import CreateSessionSheet from "@/components/Cells/CreateSessionSheet";
import SessionCard from "@/components/Cells/SessionCard";
import SharedBody from "@/components/shared/SharedBody";
import { useSingleCellQuery } from "@/hooks/Cell/useSingleCellQuery";
import { useCellSessionsQuery } from "@/hooks/CellAttendance/useCellAttendanceQuery";
import { CellSession } from "@/services/CellAttendance/cellAttendance.type";
import {
	BottomSheetModal,
	BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";

const TODAY = new Date(new Date().setHours(0, 0, 0, 0));

const isUpcomingOrLive = (session: CellSession) =>
	new Date(session.meeting_date) >= TODAY;

type SectionItem =
	| { type: "header"; label: string }
	| { type: "session"; data: CellSession }
	| { type: "create-card" };

const SectionHeader = ({ label }: { label: string }) => (
	<View className="pt-5 pb-2">
		<Text className="text-xs font-bold text-gray-400 tracking-widest">
			{label}
		</Text>
	</View>
);

const CreateSessionCard = ({ onPress }: { onPress: () => void }) => (
	<Pressable
		onPress={onPress}
		className="p-4 my-2 bg-green-50 rounded-2xl  border border-green-200"
		style={{ elevation: 2 }}
	>
		<View className="flex-row items-center justify-between">
			<View className="flex-1 ">
				<Text className="text-base font-bold text-gray-900">
					Create New Session
				</Text>
				<Text className="text-xs text-gray-600">
					Schedule a meeting for your cell
				</Text>
			</View>
			<View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center">
				<Plus size={20} color="#ffffff" strokeWidth={2.5} />
			</View>
		</View>
	</Pressable>
);

export default function SessionsScreen() {
	const { cell_id } = useLocalSearchParams<{ cell_id: string }>();
	const cellId = Number(cell_id);
	const router = useRouter();
	const createSessionSheetModalRef = useRef<BottomSheetModal>(null);
	const [refreshing, setRefreshing] = useState(false);

	const {
		data: sessions,
		isLoading: isSessionsLoading,
		isError: isSessionsError,
		refetch: refetchSessions,
	} = useCellSessionsQuery(cellId);

	const { data: cellData } = useSingleCellQuery(cellId);

	const handleRefresh = async () => {
		setRefreshing(true);
		await refetchSessions();
		setRefreshing(false);
	};

	const upcoming = (sessions ?? [])
		.filter(isUpcomingOrLive)
		.sort(
			(a, b) =>
				new Date(a.meeting_date).getTime() -
				new Date(b.meeting_date).getTime(),
		);

	const past = (sessions ?? [])
		.filter((s) => !isUpcomingOrLive(s))
		.sort(
			(a, b) =>
				new Date(b.meeting_date).getTime() -
				new Date(a.meeting_date).getTime(),
		);

	const listData: SectionItem[] = [
		{ type: "create-card" as const },
		...(upcoming.length > 0
			? [
					{ type: "header" as const, label: "UPCOMING & LIVE" },
					...upcoming.map((s) => ({
						type: "session" as const,
						data: s,
					})),
				]
			: []),
		...(past.length > 0
			? [
					{ type: "header" as const, label: "PAST SESSIONS" },
					...past.map((s) => ({ type: "session" as const, data: s })),
				]
			: []),
	];

	const header = (
		<View className="mb-2">
			<View className="w-9 h-1 bg-red-600 rounded-full mb-3" />
			<Text className="text-3xl font-bold text-gray-900 tracking-tight">
				{cellData?.cell_name
					? `${cellData.cell_name}'s Sessions`
					: "Sessions"}
			</Text>
			<Text className="text-sm text-gray-400 mt-1">
				{upcoming.length} upcoming · {past.length} past
			</Text>
		</View>
	);

	if (isSessionsLoading) {
		return (
			<SharedBody>
				<ScrollView
					contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
				>
					{header}
					<View className="items-center py-16">
						<ActivityIndicator color="#d6361e" size="large" />
					</View>
				</ScrollView>
			</SharedBody>
		);
	}

	if (isSessionsError) {
		return (
			<SharedBody>
				<ScrollView
					contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
				>
					{header}
					<View className="items-center py-16">
						<Text className="text-red-600 text-base">
							Failed to load sessions.
						</Text>
					</View>
				</ScrollView>
			</SharedBody>
		);
	}

	return (
		<SharedBody>
			<BottomSheetModalProvider>
				<FlashList
					data={listData}
					estimatedItemSize={90}
					refreshing={refreshing}
					onRefresh={handleRefresh}
					keyExtractor={(item, index) => {
						if (item.type === "header") return `header-${index}`;
						if (item.type === "create-card") return "create-card";
						return String(item.data.id);
					}}
					getItemType={(item) => item.type}
					contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
					ListHeaderComponent={header}
					ListEmptyComponent={
						upcoming.length === 0 && past.length === 0 ? (
							<View className="items-center pt-16 gap-2">
								<Text className="text-gray-400 text-base">
									No sessions yet.
								</Text>
								<Text className="text-gray-300 text-sm">
									Create one using the card above.
								</Text>
							</View>
						) : null
					}
					renderItem={({ item }) => {
						if (item.type === "header") {
							return <SectionHeader label={item.label} />;
						}
						if (item.type === "create-card") {
							return (
								<CreateSessionCard
									onPress={() =>
										createSessionSheetModalRef.current?.present()
									}
								/>
							);
						}
						return (
							<SessionCard
								session={item.data}
								onPress={() =>
									router.push({
										pathname:
											"/(app)/cells/sessions/[sessionId]",
										params: {
											sessionId: item.data.id,
											cellId: cellId,
										},
									})
								}
							/>
						);
					}}
				/>

				<CreateSessionSheet
					ref={createSessionSheetModalRef}
					ledCells={
						cellData
							? [{ id: cellData.id!, name: cellData.cell_name! }]
							: []
					}
				/>
			</BottomSheetModalProvider>
		</SharedBody>
	);
}
