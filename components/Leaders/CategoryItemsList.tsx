import { MediaResource } from "@/services/Resource/resource.type";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { View } from "react-native";
import SingleGalleryItem from "./SingleGalleryItem";

type CategoryItemsListProps = {
	items: MediaResource[];
};

const CategoryItemsList = ({ items }: CategoryItemsListProps) => {
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
