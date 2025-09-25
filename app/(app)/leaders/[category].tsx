import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useCategorResourceQuery } from "@/hooks/Resource/useCategoryResroucesQuery";
import { MediaResource } from "@/services/Resource/resource.type";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
	ActivityIndicator,
	Image,
	Linking,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const CategoryResources = () => {
	const { category } = useLocalSearchParams<{ category: string }>();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isPending,
		isError,
	} = useCategorResourceQuery(category);
	const resources = useMemo(
		() => data?.pages.flatMap((page) => page.items) ?? [],
		[data]
	);

	const handleItemPress = async (url: string) => {
		try {
			await Linking.openURL(url);
		} catch (error) {
			console.error("Error opening URL:", error);
		}
	};

	const filteredResources = useMemo(
		() =>
			resources.filter((r: MediaResource) =>
				r.title.toLowerCase().includes(searchQuery.toLowerCase())
			),
		[searchQuery, resources]
	);

	if (isPending) {
		return <Text className="p-6">Loading...</Text>;
	}

	if (isError) {
		return (
			<Text className="p-6 text-red-500">Error loading resources</Text>
		);
	}

	return (
		<SharedBody>
			{/* Search */}
			<SharedSearchBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				placeholder={`Search keywords...`}
			/>

			{/* List */}
			<FlashList
				data={filteredResources}
				keyExtractor={(item) => item.id.toString()}
				estimatedItemSize={80}
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingVertical: 16,
				}}
				renderItem={({ item }) => (
					<TouchableOpacity
						className="bg-white rounded-[15px] p-4 mb-3 flex-row items-center justify-between"
						style={{
							shadowRadius: 5, // Override the default blur
							shadowOpacity: 0.05,
						}}
						onPress={() => handleItemPress(item.drive_view_link)}
					>
						<View className="flex-1 gap-y-1">
							<Image
								source={{
									uri: item.thumbnail_id
										? `https://drive.google.com/thumbnail?id=${item.thumbnail_id}`
										: `https://drive.google.com/thumbnail?id=${item.drive_file_id}`,
								}}
								className="w-full h-56 rounded-[15px] mb-3"
								resizeMode="contain"
							/>
							<Text
								className="font-bold text-xl"
								numberOfLines={2}
								ellipsizeMode="tail"
							>
								{item.title}
							</Text>
							<Text
								className="text-sm text-gray-500"
								numberOfLines={2}
								ellipsizeMode="tail"
							>
								{item.description || "No description"}
							</Text>
							<Text
								className="text-xs text-gray-500"
								numberOfLines={2}
								ellipsizeMode="tail"
							>
								{item.file_type === "PDF"
									? "PDF Document"
									: "Video"}
							</Text>
						</View>
					</TouchableOpacity>
				)}
				onEndReached={() => {
					if (hasNextPage && !isFetchingNextPage) {
						fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.5}
				ListFooterComponent={
					isFetchingNextPage ? (
						<ActivityIndicator
							size="small"
							color="#007AFF"
							className="my-4"
						/>
					) : null
				}
			/>
		</SharedBody>
	);
};

export default CategoryResources;
