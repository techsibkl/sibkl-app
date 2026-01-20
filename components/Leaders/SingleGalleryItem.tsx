import { MediaResource } from "@/services/Resource/resource.type";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import SharedModal from "../shared/SharedModal";
import ViewResourceDialog from "./ViewResourceDialog";

type SingleGalleryItemProps = {
	item: MediaResource;
};

export default function SingleGalleryItem({ item }: SingleGalleryItemProps) {
	const [modalVisible, setModalVisible] = useState(false);
	const { resource_id } = useLocalSearchParams();
	useEffect(() => {
		if (resource_id && resource_id == item.id) {
			setModalVisible(true);
		}
	}, [resource_id]);

	const closeModal = () => {
		setModalVisible(false);
		if (resource_id) {
			// clear params AFTER consuming
			router.replace("/(app)/leaders");
		}
	};
	return (
		<>
			<TouchableOpacity
				className="w-48 bg-white border-border border rounded-[15px] mb-3"
				onPress={() => setModalVisible(true)}
			>
				<View className="flex flex-col">
					<Image
						source={{
							uri: item.thumbnail_id
								? `https://drive.google.com/thumbnail?id=${item.thumbnail_id}`
								: `https://drive.google.com/thumbnail?id=${item.drive_file_id}`,
						}}
						className="w-full h-28 rounded-t-lg"
						resizeMode="cover"
					/>
					<View className="flex-grow p-4">
						<Text
							className="text-text text-base font-medium"
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
				</View>
			</TouchableOpacity>
			<SharedModal visible={modalVisible} onClose={closeModal}>
				<ViewResourceDialog resource={item} />
			</SharedModal>
		</>
	);
}
