import { MediaResource } from "@/services/Resource/resource.type";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import SharedSectionHeader from "../shared/SharedSectionHeader";
import CategoryItemsList from "./CategoryItemsList";

type CategoryListProps = {
	groupedResources: { category: string; items: MediaResource[] }[];
};

const CategoryList = ({ groupedResources }: CategoryListProps) => {
	const router = useRouter();

	const goToAll = (category: string) => {
		router.push({
			pathname: "/(app)/leaders/[category]",
			params: { category: category },
		});
	};

	return (
		<FlashList
			data={groupedResources}
			keyExtractor={(_, index) => index.toString()}
			ItemSeparatorComponent={() => <View className="h-6" />}
			contentContainerStyle={{
				paddingVertical: 16,
			}}
			estimatedItemSize={200} // tune this for better perf
			renderItem={({ item: group }) => (
				<View>
					{/* Category Header */}
					<SharedSectionHeader
						title={group.category}
						onPress={() => goToAll(group.category)}
					/>

					{/* Category Items */}
					<CategoryItemsList items={group.items.slice(0, 10)} />
				</View>
			)}
		/>
	);
};

export default CategoryList;
