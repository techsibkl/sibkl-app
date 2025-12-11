"use client";

import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useThemeColors } from "@/hooks/useThemeColor";
import React, { useMemo, useState } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";

import FlowSelector from "@/components/Flows/FlowSelect";
import PeopleFlowList from "@/components/Flows/PeopleFlowAssignedList";
import { useFlowsQuery, usePeopleFlowQuery } from "@/hooks/Flows/useFlowsQuery";
import { useAuthStore } from "@/stores/authStore";
import { CheckIcon } from "lucide-react-native";

const FlowsPage = () => {
	const { isDark } = useThemeColors();
	const { user } = useAuthStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [isMeMode, setIsMeMode] = useState(false);
	// This is for single selected flow list
	const [selectedFlowId, setSelectedFlowId] = useState<number>(0);

	// Getting people assigned to me from ALL flows
	const { data: singleFlowPeople } = usePeopleFlowQuery(selectedFlowId);
	const { data: peopleFlow } = usePeopleFlowQuery(
		undefined,
		user?.person?.id
	);
	const flowIds = [...new Set(peopleFlow?.map((p) => p.flow_id) || [])];
	const { data: flows } = useFlowsQuery(flowIds as number[]);

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

	return (
		<SharedBody>
			<StatusBar
				className="bg-background dark:bg-background-dark"
				barStyle={isDark ? "light-content" : "dark-content"}
			/>

			<SharedSearchBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				placeholder="Search keywords..."
			/>

			<View className="flex-row w-full justify-between gap-2 items-center px-4 py-2">
				{/* Flow Selector always visible */}
				<FlowSelector
					flows={flows ?? []}
					selectedFlowId={selectedFlowId}
					onSelect={setSelectedFlowId}
				/>

				{/* Toggle button only shows if not ALL */}
				{selectedFlowId && (
					<TouchableOpacity
						onPress={() => setIsMeMode((prev) => !prev)}
						className={`flex flex-row items-center justify-center gap-2 px-4 py-3 rounded-[15px] border   ${isMeMode ? "bg-blue-500 border-blue-500" : "bg-transparent border-blue-300"}`}
						activeOpacity={0.7}
					>
						{/* Label */}
						<View>
							<Text
								className={`text-sm font-semibold ${isMeMode ? "text-white" : "text-blue-300"}`}
							>
								Assigned
							</Text>
						</View>

						{/* Trailing icon */}
						{isMeMode && <CheckIcon color={"#fff"} size={16} />}
					</TouchableOpacity>
				)}
			</View>

			<PeopleFlowList
				key={flows?.map((f) => f.id).toString()}
				peopleFlow={effectivePeopleFlow}
				flows={flows}
				selectedFlowId={selectedFlowId}
			/>
		</SharedBody>
	);
};
export default FlowsPage;
