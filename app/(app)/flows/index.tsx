import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import React, { useEffect, useMemo, useState } from "react";
import { StatusBar, TouchableOpacity, View } from "react-native";

import FlowSelector from "@/components/Flows/FlowSelect";
import PeopleFlowList from "@/components/Flows/PeopleFlowAssignedList";
import SharedBody from "@/components/shared/SharedBody";
import { useFlowsQuery, usePeopleFlowQuery } from "@/hooks/Flows/useFlowsQuery";
import { useAuthStore } from "@/stores/authStore";
import { useLocalSearchParams } from "expo-router";
import { CheckIcon } from "lucide-react-native";
import { Text } from "react-native";

const FlowsPage = () => {
	const { user } = useAuthStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [isMeMode, setIsMeMode] = useState(false);

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
	const { data: singleFlowPeople, refetch: singleFlowRefetch } =
		usePeopleFlowQuery(selectedFlowId);
	const { data: peopleFlow, refetch } = usePeopleFlowQuery(
		undefined,
		user?.person?.id
	);
	const flowIds = useMemo(
		() => [...new Set(peopleFlow?.map((p) => p.flow_id) || [])],
		[peopleFlow]
	);

	const { data: flows, refetch: flowRefetch } = useFlowsQuery(
		flowIds as number[]
	);

	const effectivePeopleFlow = useMemo(() => {
		let list =
			selectedFlowId === 0
				? (peopleFlow ?? []) // ALL flows
				: (singleFlowPeople ?? []); // Single flow

		// Apply search filter
		list = list.filter(
			(person) =>
				person?.p__full_name
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				person?.p__phone?.includes(searchQuery)
		);

		// Apply assigned-to-me filter only if viewMode is "assigned"
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

			<View className="flex-row w-full justify-between gap-2 items-center px-4 py-2">
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
									{"Assigned"}
								</Text>
							</View>

							{isMeMode && <CheckIcon color={"#fff"} size={16} />}
						</TouchableOpacity>
					)}
				</>
			</View>

			<PeopleFlowList
				key={flows?.map((f) => f.id).toString()}
				peopleFlow={effectivePeopleFlow}
				flows={flows}
				selectedFlowId={selectedFlowId}
				onRefresh={refresh}
			/>
		</SharedBody>
	);
};

export default FlowsPage;
