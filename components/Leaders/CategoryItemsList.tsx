import { MediaResource } from "@/services/Resource/resource.type";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SkeletonRow } from "../shared/Skeleton/SkeletonRow";
import SingleGalleryItem from "./SingleGalleryItem";

type CategoryItemsListProps = {
	items: MediaResource[];
	isLoading?: boolean;
};

const CategoryItemsList = ({ items, isLoading }: CategoryItemsListProps) => {
	if (isLoading) {
		return (
			<ScrollView
				horizontal
				scrollEnabled={false}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
			>
				{Array.from({ length: 3 }).map((_, i) => (
					<View
						key={i}
						className="w-48 bg-white border-border border rounded-[15px] mb-3 pb-2 overflow-hidden"
					>
						<SkeletonRow width="100%" height={112} borderRadius={0} />
						<View className="p-4">
							<SkeletonRow width="80%" height={14} />
							<SkeletonRow width="50%" height={12} />
						</View>
					</View>
				))}
			</ScrollView>
		);
	}

	if (items.length === 0) {
		return (
			<View className="h-24 items-center justify-center px-12">
				<Text className="text-gray-400 text-sm text-center">
					No content available for this category
				</Text>
			</View>
		);
	}

	return (
		<FlashList
			horizontal
			data={items}
			keyExtractor={(_, index) => index.toString()}
			estimatedItemSize={70}
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{
				paddingHorizontal: 12,
			}}
			ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
			renderItem={({ item }) => <SingleGalleryItem item={item} />}
		/>
	);
};

export default CategoryItemsList;
