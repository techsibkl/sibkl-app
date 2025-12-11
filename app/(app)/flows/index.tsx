"use client";

import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useThemeColors } from "@/hooks/useThemeColor";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import PeopleFlowList from "@/components/Flows/PeopleFlowList";
import {
    usePeopleFlowQuery,
    useSingleFlowQuery,
} from "@/hooks/Flows/useFlowsQuery";
import { Grid3x2Icon, ListIcon } from "lucide-react-native";

const FlowsPage = () => {
	const { isDark } = useThemeColors();
	const {
		data: peopleFlow,
		isPending,
		error,
		isError,
	} = usePeopleFlowQuery(2);
	const { data: flow } = useSingleFlowQuery(2);
	const [searchQuery, setSearchQuery] = useState("");

	const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");

	const filteredPeopleFlow = useMemo(() => {
		return (peopleFlow ?? []).filter(
			(person) =>
				person?.p__full_name
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				person?.p__phone?.includes(searchQuery)
		);
	}, [peopleFlow, searchQuery]);

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

			{/* toggle buttons */}
			<View className="flex-row justify-between items-center px-4 py-2">
				<Text className="text-sm text-gray-800 font-semibold">
					Assigned to Me
				</Text>
				<TouchableOpacity
					onPress={() =>
						setViewMode(viewMode === "gallery" ? "list" : "gallery")
					}
				>
					{viewMode === "gallery" ? (
						<ListIcon size={22} color="#999" />
					) : (
						<Grid3x2Icon size={22} color="#999" />
					)}
				</TouchableOpacity>
			</View>
			{flow != undefined ? (
				<PeopleFlowList
					peopleFlow={filteredPeopleFlow ?? []}
					flow={flow}
				/>
			) : (
				<ActivityIndicator />
			)}
			{/* 
            
			{viewMode === "gallery" ? (
				<ScrollView showsVerticalScrollIndicator={false}>
					<CategoryList groupedResources={groupedResources} />
				</ScrollView>
			) : (
				<FolderList groupedResources={groupedResources} />
			)} */}
		</SharedBody>
	);
};
export default FlowsPage;
