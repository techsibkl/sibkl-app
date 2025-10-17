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
import { MediaResource } from "@/services/Resource/resource.type";
import { ArrowUp, Grid3x2Icon, ListIcon } from "lucide-react-native";

const LeadersPage = () => {
	const { isDark } = useThemeColors();
	const { data: resources, isPending, isError } = useResourcesQuery();
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");
	const [selectedResource, setSelectedResource] =
		useState<MediaResource | null>(null);

	const groupedResources = useFilteredResources(resources, searchQuery);

	// computed for FlashList section data
	const sectionData = React.useMemo(() => {
		if (!groupedResources) return [];
		return groupedResources.map((group) => ({
			title: group.category,
			data: group.items,
		}));
	}, [groupedResources]);

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
			<View className="flex-row justify-between px-4 py-2">
				<View className="flex-row gap-2 items-center">
					<Text>Name</Text>
					<ArrowUp size={16} color="#99aaffff" />
				</View>
				<TouchableOpacity
					onPress={() =>
						setViewMode(viewMode === "gallery" ? "list" : "gallery")
					}
					className="self-end mb-2"
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
				<FolderList
					groupedResources={groupedResources}
					onResourcePress={setSelectedResource}
				/>
			)}
		</SharedBody>
	);
};
export default LeadersPage;
