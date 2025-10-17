import { MediaResource } from "@/services/Resource/resource.type";
import { FlashList } from "@shopify/flash-list";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface GroupedResource {
	category: string;
	items: MediaResource[];
}

interface FolderListProps {
	groupedResources: GroupedResource[];
	onResourcePress?: (resource: MediaResource) => void;
}

import { displayDateAsStr } from "@/utils/helper";
import {
    FileIcon,
    FolderIcon,
    ImageIcon,
    PlayCircleIcon,
} from "lucide-react-native";

const getIcon = (type?: string, color: string = "#9CA3AF") => {
	switch (type) {
		case "Video":
			return <PlayCircleIcon size={22} color={color} />;
		case "PDF":
			return <FileIcon size={22} color={color} />;
		case "Image":
			return <ImageIcon size={22} color={color} />;
		case "Folder":
			return <FolderIcon size={22} color={color} />;
		default:
			return <FileIcon size={22} color={color} />;
	}
};

const getColor = (type?: string) => {
	switch (type) {
		case "Video":
			return "#3B82F6"; // blue-500
		case "PDF":
			return "#EF4444"; // red-500
		case "Image":
			return "#6B7280"; // gray-500
		case "Folder":
			return "#111827"; // gray-900
		default:
			return "#9CA3AF"; // gray-400
	}
};

const FolderList: React.FC<FolderListProps> = ({
	groupedResources,
	onResourcePress,
}) => {
	// Flatten the grouped data into [category, item, item, category, item...]
	const flatData = useMemo(() => {
		const arr: (string | MediaResource)[] = [];
		groupedResources.forEach((group) => {
			arr.push(group.category); // header
			arr.push(...group.items); // items
		});
		return arr;
	}, [groupedResources]);

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
				if (typeof item === "string") {
					return (
						<View className="flex-row items-center gap-2 px-4 py-2 bg-background">
							<FolderIcon fill="#CCC" size={22} color="#CCC" />
							<Text className="font-bold text-xl">
								{item.toUpperCase()}
							</Text>
						</View>
					);
				}

				return (
					<Pressable
						style={styles.itemContainer}
						onPress={() => onResourcePress?.(item)}
					>
						<View className="flex-row items-center gap-2 px-4">
							{getIcon(item.file_type, getColor(item.file_type))}
							<View>
								<Text>{item.title}</Text>
								<Text className="text-sm text-gray-500">
									{item.file_type} • {item.file_size} •{" "}
									{displayDateAsStr(item.upload_date)}
								</Text>
							</View>
						</View>
					</Pressable>
				);
			}}
		/>
	);
};

const styles = StyleSheet.create({
	itemContainer: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#ddd",
	},
});

export default FolderList;
