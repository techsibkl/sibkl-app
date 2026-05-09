import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import React, { useEffect, useMemo, useState } from "react";
import { StatusBar, TouchableOpacity, View } from "react-native";

import FlowSelector from "@/components/Flows/FlowSelect";
import PeopleFlowList from "@/components/Flows/PeopleFlowAssignedList";
import SortButton from "@/components/Flows/SortButton";
import FlowStatusTabs from "@/components/Flows/StatusTabs";
import SharedBody from "@/components/shared/SharedBody";
import { useFlowsQuery, usePeopleFlowQuery } from "@/hooks/Flows/useFlowsQuery";
import {
	FlowSortKey,
	FlowSortOrder,
	FlowStatus,
} from "@/services/Flow/flow.types";
import { useAuthStore } from "@/stores/authStore";
import { useLocalSearchParams } from "expo-router";
import { CheckIcon } from "lucide-react-native";
import { Text } from "react-native";

const FlowsPage = () => {
	const { user } = useAuthStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [isMeMode, setIsMeMode] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<FlowStatus | null>(
		null,
	);
	const [sortKey, setSortKey] = useState<FlowSortKey | null>(null);
	const [sortOrder, setSortOrder] = useState<FlowSortOrder>("desc");

	// This is for single selected flow list
	const [selectedFlowId, setSelectedFlowId] = useState<number>(0);
	const { flow_id, isMeMode: isMeModeParam } = useLocalSearchParams<{
		flow_id?: string;
		isMeMode?: string;
	}>();

	useEffect(() => {
		if (flow_id) {
			setSelectedFlowId(Number(flow_id));
			setIsMeMode(isMeModeParam === "true");
		} else {
			setSelectedFlowId(0);
		}
	}, [flow_id, isMeModeParam]);

	// Getting people from SINGLE selected flow
	const {
		data: singleFlowPeople,
		isPending: singleFlowPending,
		refetch: singleFlowRefetch,
	} = usePeopleFlowQuery(selectedFlowId);

	// Getting people from ALL flows (only when selectedFlowId === 0)
	const {
		data: allFlowsPeople,
		isPending: allFlowsPending,
		refetch: allFlowsRefetch,
	} = usePeopleFlowQuery(0);

	const flowIds = useMemo(
		() => [...new Set(allFlowsPeople?.map((p) => p.flow_id) || [])],
		[allFlowsPeople],
	);

	const {
		data: flows,
		isPending: flowsPending,
		refetch: flowRefetch,
	} = useFlowsQuery(flowIds as number[]);

	const allPending = useMemo(() => {
		return selectedFlowId === 0
			? allFlowsPending || flowsPending
			: singleFlowPending || flowsPending;
	}, [selectedFlowId, allFlowsPending, singleFlowPending, flowsPending]);

	// Pre-status-filter list (search + isMeMode applied) — fed into the tab counts
	const preFilteredPeopleFlow = useMemo(() => {
		let list =
			selectedFlowId === 0
				? (allFlowsPeople ?? [])
				: (singleFlowPeople ?? []);

		// Search filter
		list = list.filter(
			(person) =>
				person?.p__full_legal_name
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				person?.p__phone?.includes(searchQuery),
		);

		// Apply isMeMode frontend filter
		if (isMeMode) {
			list = list.filter((p) => p.assignee_id === user?.person?.id);
		}

		return list;
	}, [
		selectedFlowId,
		allFlowsPeople,
		singleFlowPeople,
		searchQuery,
		isMeMode,
		user?.person?.id,
	]);

	// Final list — status tab + sort applied on top
	const effectivePeopleFlow = useMemo(() => {
		let list =
			selectedStatus === null
				? preFilteredPeopleFlow
				: preFilteredPeopleFlow.filter(
						(p) => p.status === selectedStatus,
					);

		if (sortKey) {
			list = [...list].sort((a, b) => {
				const aVal = a[sortKey] ? new Date(a[sortKey]).getTime() : 0;
				const bVal = b[sortKey] ? new Date(b[sortKey]).getTime() : 0;
				return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
			});
		}

		return list;
	}, [preFilteredPeopleFlow, selectedStatus, sortKey, sortOrder]);

	const handleSortChange = (key: FlowSortKey, order: FlowSortOrder) => {
		setSortKey(key);
		setSortOrder(order);
	};

	const handleSortClear = () => {
		setSortKey(null);
		setSortOrder("desc");
	};
	const refresh = async () => {
		if (selectedFlowId === 0) {
			await allFlowsRefetch();
		} else {
			await singleFlowRefetch();
		}
		flowRefetch();
	};

	return (
		<SharedBody>
			<StatusBar className="bg-background" />
			<View className="flex-row items-center pr-4 pb-4 border-b border-border">
				<View className="flex-1">
					<SharedSearchBar
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						placeholder="Search keywords..."
						unstyled
					/>
				</View>
				<SortButton
					sortKey={sortKey}
					sortOrder={sortOrder}
					onChange={handleSortChange}
					onClear={handleSortClear}
				/>
			</View>
			<View className="flex-row w-full justify-between gap-2 items-center px-4 mt-4">
				<FlowSelector
					flows={flows ?? []}
					selectedFlowId={selectedFlowId}
					onSelect={setSelectedFlowId}
				/>
				<TouchableOpacity
					onPress={() => setIsMeMode((prev) => !prev)}
					className={`flex flex-row items-center justify-center gap-2 px-4 py-3 rounded-[15px] border ${isMeMode ? "bg-blue-500 border-blue-500" : "bg-transparent border-blue-300"}`}
					activeOpacity={0.7}
				>
					<View>
						<Text
							className={`text-sm font-semibold ${isMeMode ? "text-white" : "text-blue-300"}`}
						>
							{"Assigned to Me"}
						</Text>
					</View>

					{isMeMode && <CheckIcon color={"#fff"} size={16} />}
				</TouchableOpacity>
			</View>

			{/* Status tab bar — counts reflect search + me-mode filter */}
			<FlowStatusTabs
				peopleFlow={preFilteredPeopleFlow}
				selectedStatus={selectedStatus}
				onSelect={setSelectedStatus}
			/>

			<PeopleFlowList
				key={flows?.map((f) => f.id).toString()}
				peopleFlow={effectivePeopleFlow}
				flows={flows}
				selectedFlowId={selectedFlowId}
				onRefresh={refresh}
				isPending={allPending}
			/>
		</SharedBody>
	);
};

export default FlowsPage;
