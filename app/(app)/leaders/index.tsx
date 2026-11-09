"use client";

import CategoryList from "@/components/Leaders/CategoryList";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useFilteredResources } from "@/hooks/Resource/useFilteredResources";
import { useResourcesQuery } from "@/hooks/Resource/useResourceQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	RefreshControl,
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
	const { isGuest } = useAuthStore();
	const router = useRouter();
	const {
		data: resources,
		isPending,
		isPlaceholderData,
		isError,
		refetch,
	} = useResourcesQuery();
	const isLoading = isPending || isPlaceholderData;
	const [refreshing, setRefreshing] = useState(false);
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

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			await refetch();
		} finally {
			setRefreshing(false);
		}
	};

	const refreshControl = (
		<RefreshControl
			refreshing={refreshing}
			onRefresh={handleRefresh}
			colors={["#d6361e"]}
			tintColor="#d6361e"
		/>
	);

	// Guest users cannot access leaders page
	if (isGuest) {
		return (
			<SharedBody>
				<StatusBar
					className="bg-background"
					barStyle={isDark ? "light-content" : "dark-content"}
				/>
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-2xl font-bold text-text mb-2">
						Sign In Required
					</Text>
					<Text className="text-text-secondary text-center mb-6">
						You need to sign in to access the Leaders section
					</Text>
					<TouchableOpacity
						onPress={() => router.replace("/(auth)/sign-in")}
						className="bg-blue-600 px-6 py-3 rounded-lg"
					>
						<Text className="text-white font-semibold">Sign In</Text>
					</TouchableOpacity>
				</View>
			</SharedBody>
		);
	}

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

			{viewMode === "gallery" ? (
				<ScrollView
					showsVerticalScrollIndicator={false}
					refreshControl={refreshControl}
				>
					<CategoryList
						groupedResources={groupedResources}
						isLoading={isLoading}
					/>
				</ScrollView>
			) : isLoading ? (
				<SkeletonGallery />
			) : (
				<FolderList
					groupedResources={groupedResources}
					refreshControl={refreshControl}
				/>
			)}
		</SharedBody>
	);
};
export default LeadersPage;
