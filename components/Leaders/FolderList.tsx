import { MediaResource } from "@/services/Resource/resource.type";
import { FlashList } from "@shopify/flash-list";
import { ChevronDown, ChevronRight, FolderIcon } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import SingleFileItem from "./SingleFileItem";

interface GroupedResource {
	category: string;
	items: MediaResource[];
}

interface FolderListProps {
	groupedResources: GroupedResource[];
}

const FolderList: React.FC<FolderListProps> = ({ groupedResources }) => {
	const [expandedCategories, setExpandedCategories] = useState<
		Record<string, boolean>
	>({});

	// Flatten the grouped data into [category, item, item, category, item...]
	const flatData = useMemo(() => {
		const arr: (string | MediaResource)[] = [];
		groupedResources.forEach((group) => {
			arr.push(group.category);
			if (expandedCategories[group.category]) {
				arr.push(...group.items);
			}
		});
		return arr;
	}, [groupedResources, expandedCategories]);

	// Compute which indices are headers
	const stickyHeaderIndices = useMemo(() => {
		const indices: number[] = [];
		flatData.forEach((item, index) => {
			if (typeof item === "string") indices.push(index);
		});
		return indices;
	}, [flatData]);

	return (
		<FlashList
			data={flatData}
			keyExtractor={(item, index) =>
				typeof item === "string"
					? `header-${item}-${index}`
					: (item.id ?? `${index}`)
			}
			estimatedItemSize={70}
			stickyHeaderIndices={stickyHeaderIndices}
			getItemType={(item) =>
				typeof item === "string" ? "sectionHeader" : "row"
			}
			renderItem={({ item }) => {
				// CATEGORY HEADER
				if (typeof item === "string") {
					const isExpanded = expandedCategories[item];

					return (
						<TouchableOpacity
							onPress={() =>
								setExpandedCategories((prev) => ({
									...prev,
									[item]: !prev[item],
								}))
							}
						>
							<View className="flex-row items-center gap-2 px-4 py-2 bg-background">
								<FolderIcon
									fill="#CCC"
									size={22}
									color="#CCC"
								/>
								<Text className="font-bold text-xl">
									{item.toUpperCase()}
								</Text>
								<View className="flex-grow" />
								{isExpanded ? (
									<ChevronDown size={18} color="#333" />
								) : (
									<ChevronRight size={18} color="#333" />
								)}
							</View>
						</TouchableOpacity>
					);
				}
				// RESOURCE ITEM
				return <SingleFileItem item={item} />;
			}}
		/>
	);
};

export default FolderList;
