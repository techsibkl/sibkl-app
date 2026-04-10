import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import React, { useEffect, useMemo, useState } from "react";
import { StatusBar, TouchableOpacity, View } from "react-native";

import FlowSelector from "@/components/Flows/FlowSelect";
import PeopleFlowList from "@/components/Flows/PeopleFlowAssignedList";
import FlowStatusTabs from "@/components/Flows/StatusTabs";
import SharedBody from "@/components/shared/SharedBody";
import { useFlowsQuery, usePeopleFlowQuery } from "@/hooks/Flows/useFlowsQuery";
import { FlowStatus } from "@/services/Flow/flow.types";
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
		}
	}, [flow_id, isMeModeParam]);

	// Getting people assigned to me from ALL flows
	const {
		data: singleFlowPeople,
		isPending: singleFlowPending,
		refetch: singleFlowRefetch,
	} = usePeopleFlowQuery(selectedFlowId);
	const {
		data: peopleFlow,
		isPending: allPeoplePending,
		refetch,
	} = usePeopleFlowQuery(undefined, user?.person?.id);
	const flowIds = useMemo(
		() => [...new Set(peopleFlow?.map((p) => p.flow_id) || [])],
		[peopleFlow],
	);

	const {
		data: flows,
		isPending: flowsPending,
		refetch: flowRefetch,
	} = useFlowsQuery(flowIds as number[]);

	const allPending = useMemo(() => {
		return singleFlowPending || allPeoplePending || flowsPending;
	}, [singleFlowPending, allPeoplePending, flowsPending]);

	// Pre-status-filter list (search + me mode applied) — fed into the tab counts
	const preFilteredPeopleFlow = useMemo(() => {
		let list =
			selectedFlowId === 0
				? (peopleFlow ?? [])
				: (singleFlowPeople ?? []);

		list = list.filter(
			(person) =>
				person?.p__full_legal_name
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				person?.p__phone?.includes(searchQuery),
		);

		if (isMeMode) {
			list = list.filter((p) => p.assignee_id === user?.person?.id);
		}

		return list;
	}, [
		selectedFlowId,
		peopleFlow,
		singleFlowPeople,
		searchQuery,
		isMeMode,
		user?.person?.id,
	]);

	// Final list shown in the list — status tab applied on top
	const effectivePeopleFlow = useMemo(() => {
		if (selectedStatus === null) return preFilteredPeopleFlow;
		return preFilteredPeopleFlow.filter((p) => p.status === selectedStatus);
	}, [preFilteredPeopleFlow, selectedStatus]);

	const refresh = async () => {
		selectedFlowId === 0 ? await refetch() : await singleFlowRefetch();
		flowRefetch();
	};

	return (
		<SharedBody>
			<StatusBar className="bg-background" />

			<SharedSearchBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				placeholder="Search keywords..."
			/>

			<View className="flex-row w-full justify-between gap-2 items-center px-4 mt-2">
				<FlowSelector
					flows={flows ?? []}
					selectedFlowId={selectedFlowId}
					onSelect={setSelectedFlowId}
				/>
				<>
					{selectedFlowId !== 0 && (
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
					)}
				</>
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
