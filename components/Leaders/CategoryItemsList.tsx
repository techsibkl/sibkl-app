import { MediaResource } from "@/services/Resource/resource.type";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { Image, Linking, Text, TouchableOpacity, View } from "react-native";

type CategoryItemsListProps = {
	items: MediaResource[];
};

const CategoryItemsList = ({ items }: CategoryItemsListProps) => {
	const handleItemPress = async (url: string) => {
		try {
			await Linking.openURL(url);
		} catch (error) {
			console.error("Error opening URL:", error);
		}
	};

	return (
		<FlashList
			horizontal
			data={items}
			keyExtractor={(_, index) => index.toString()}
			estimatedItemSize={70}
			contentContainerStyle={{ paddingHorizontal: 16 }}
			showsHorizontalScrollIndicator={false}
			ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
			renderItem={({ item }) => (
				<TouchableOpacity
					className="w-48 bg-background border-border border rounded-lg p-4 flex-row items-center justify-between mb-3"
					onPress={() => handleItemPress(item.drive_view_link)}
				>
					<View className="flex-1">
						<Image
							source={{
								uri: item.thumbnail_id
									? `https://drive.google.com/thumbnail?id=${item.thumbnail_id}`
									: `https://drive.google.com/thumbnail?id=${item.drive_file_id}`,
							}}
							className="w-full h-28 rounded-lg mb-3"
							resizeMode="cover"
						/>
						<Text
							className="text-text text-base font-medium mb-1"
							numberOfLines={2}
							ellipsizeMode="tail"
						>
							{item.title}
						</Text>
						<Text
							className="text-text-secondary text-sm capitalize"
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
		/>
	);
};

export default CategoryItemsList;
