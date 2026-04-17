import ViewResourceDialog, {
	getThumbnail,
} from "@/components/Leaders/ViewResourceDialog";
import SharedBody from "@/components/shared/SharedBody";
import SharedModal from "@/components/shared/SharedModal";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useCategorResourceQuery } from "@/hooks/Resource/useCategoryResroucesQuery";
import { MediaResource } from "@/services/Resource/resource.type";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
	ActivityIndicator,
	Image,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const CategoryResources = () => {
	const { category } = useLocalSearchParams<{ category: string }>();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedResource, setSelectedResource] =
		useState<MediaResource | null>(null);

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
		[data],
	);

	const filteredResources = useMemo(
		() =>
			resources.filter((r: MediaResource) =>
				r.title.toLowerCase().includes(searchQuery.toLowerCase()),
			),
		[searchQuery, resources],
	);

	if (isPending) return <Text className="p-6">Loading...</Text>;
	if (isError)
		return (
			<Text className="p-6 text-red-500">Error loading resources</Text>
		);

	return (
		<SharedBody>
			<SharedSearchBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				placeholder="Search keywords..."
			/>

			<FlashList
				data={filteredResources}
				keyExtractor={(item) => item.id!.toString()}
				estimatedItemSize={80}
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingVertical: 16,
				}}
				renderItem={({ item }) => {
					const thumbnail = getThumbnail(item);
					return (
						<TouchableOpacity
							className="bg-white rounded-[15px] p-2 mb-3"
							style={{ shadowRadius: 5, shadowOpacity: 0.05 }}
							onPress={() => setSelectedResource(item)}
						>
							<View className="flex-1 gap-y-1">
								{thumbnail ? (
									<Image
										source={{ uri: thumbnail }}
										className="w-full h-56 rounded-[15px] mb-3"
										resizeMode="cover"
									/>
								) : (
									<View className="w-full h-56 rounded-[15px] mb-3 bg-gray-100 items-center justify-center">
										<Text className="text-gray-400 text-xs">
											No Preview
										</Text>
									</View>
								)}
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
								<Text className="text-xs text-gray-500">
									{item.file_type === "PDF"
										? "PDF Document"
										: item.youtube_link
											? "YouTube"
											: "Video"}
								</Text>
							</View>
						</TouchableOpacity>
					);
				}}
				onEndReached={() => {
					if (hasNextPage && !isFetchingNextPage) fetchNextPage();
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

			{/* Resource modal */}
			<SharedModal
				visible={!!selectedResource}
				onClose={() => setSelectedResource(null)}
			>
				{selectedResource && (
					<ViewResourceDialog resource={selectedResource} />
				)}
			</SharedModal>
		</SharedBody>
	);
};

export default CategoryResources;
