"use client";

import CategoryList from "@/components/Leaders/CategoryList";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useFilteredResources } from "@/hooks/Resource/useFilteredResources";
import { useResourcesQuery } from "@/hooks/Resource/useResourceQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import React, { useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

import FolderList from "@/components/Leaders/FolderList";
import SortDropdown from "@/components/Leaders/SortDropdown";
import { Grid3x2Icon, ListIcon } from "lucide-react-native";

const LeadersPage = () => {
	const { isDark } = useThemeColors();
	const { data: resources, isPending, isError } = useResourcesQuery();
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");
	const [sortAsc, setSortAsc] = useState(true);

	const groupedResources = useFilteredResources(
		resources,
		searchQuery,
		sortAsc
	);

	if (isPending)
		return (
			<SharedBody>
				<ActivityIndicator />
			</SharedBody>
		);

	if (isError || !resources) {
		return <Text>Error loading resources</Text>;
	}

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
				<SortDropdown sortAsc={sortAsc} setSortAsc={setSortAsc} />
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

			{viewMode === "gallery" ? (
				<ScrollView showsVerticalScrollIndicator={false}>
					<CategoryList groupedResources={groupedResources} />
				</ScrollView>
			) : (
				<FolderList groupedResources={groupedResources} />
			)}
		</SharedBody>
	);
};
export default LeadersPage;
