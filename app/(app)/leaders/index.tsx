"use client";

import CategoryList from "@/components/Leaders/CategoryList";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useFilteredResources } from "@/hooks/Resource/useFilteredResources";
import { useResourcesQuery } from "@/hooks/Resource/useResourceQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import React, { useEffect, useState } from "react";
import {
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

import FolderList from "@/components/Leaders/FolderList";
import SortDropdown from "@/components/Leaders/SortDropdown";
import SkeletonGallery from "@/components/shared/Skeleton/SkeletonGallery";
import { useLocalSearchParams } from "expo-router";
import { Grid3x2Icon, ListIcon } from "lucide-react-native";

const LeadersPage = () => {
	const { isDark } = useThemeColors();
	const { data: resources, isPending, isError } = useResourcesQuery();
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");
	const [sortAsc, setSortAsc] = useState(false);
	const { resource_id } = useLocalSearchParams();

	const groupedResources = useFilteredResources(
		resources,
		searchQuery,
		sortAsc,
	);

	useEffect(() => {
		if (resource_id) {
			setViewMode("gallery");
		}
	}, [resource_id]);

	if (isError) {
		return <Text>Error loading resources</Text>;
	}

	return (
		<SharedBody>
			<StatusBar
				className="bg-background"
				barStyle={isDark ? "light-content" : "dark-content"}
			/>

			<SharedSearchBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				placeholder="Search keywords..."
			/>

			{/* toggle buttons */}
			<View className="flex-row justify-between items-center px-4 py-2 z-50">
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

			{isPending ? (
				<SkeletonGallery />
			) : viewMode === "gallery" ? (
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
