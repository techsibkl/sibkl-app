"use client";

import CategoryList from "@/components/Leaders/CategoryList";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useFilteredResources } from "@/hooks/Resource/useFilteredResources";
import { useResourcesQuery } from "@/hooks/Resource/useResourceQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StatusBar,
	Text
} from "react-native";

const LeadersPage = () => {
	const { isDark } = useThemeColors();
	const { data: resources, isPending, isError } = useResourcesQuery();
	const [searchQuery, setSearchQuery] = useState("");

	const groupedResources = useFilteredResources(resources, searchQuery);

	// const grouped
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

			<ScrollView className="" showsVerticalScrollIndicator={false}>
				<CategoryList groupedResources={groupedResources} />
			</ScrollView>
		</SharedBody>
	);
};

export default LeadersPage;
