import { MediaResource } from "@/services/Resource/resource.type";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { ChevronRightIcon } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
		<>
			<FlashList
				data={groupedResources}
				keyExtractor={(_, index) => index.toString()}
				estimatedItemSize={200} // tune this for better perf
				renderItem={({ item: group }) => (
					<View className="mb-8">
						{/* Category Header */}
						<View className="flex-row items-center justify-between mb-4">
							<Text className="text-xl font-bold">
								{group.category}
							</Text>
							<TouchableOpacity
								className="flex-row items-center"
								onPress={() => goToAll(group.category)}
							>
								<Text className="text-sm mr-1">See All</Text>
								<ChevronRightIcon size={16} />
							</TouchableOpacity>
						</View>

						{/* Category Items */}
						<CategoryItemsList items={group.items.slice(0, 10)} />
					</View>
				)}
			/>
		</>
	);
};

export default CategoryList;
