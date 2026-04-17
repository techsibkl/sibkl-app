import { MediaResource } from "@/services/Resource/resource.type";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import SharedModal from "../shared/SharedModal";
import ViewResourceDialog from "./ViewResourceDialog";

type SingleGalleryItemProps = {
	item: MediaResource;
};

const getThumbnail = (item: MediaResource): string | null => {
	if (item.thumbnail_id)
		return `https://drive.google.com/thumbnail?id=${item.thumbnail_id}`;
	if (item.drive_file_id)
		return `https://drive.google.com/thumbnail?id=${item.drive_file_id}`;
	if (item.youtube_link) {
		try {
			const u = new URL(item.youtube_link);
			const videoId =
				u.hostname === "youtu.be"
					? u.pathname.slice(1)
					: u.searchParams.get("v");
			if (videoId)
				return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
		} catch {
			return null;
		}
	}
	return null;
};

export default function SingleGalleryItem({ item }: SingleGalleryItemProps) {
	const [modalVisible, setModalVisible] = useState(false);
	const { resource_id } = useLocalSearchParams();

	useEffect(() => {
		if (resource_id && Number(resource_id) == item.id) {
			setModalVisible(true);
		}
	}, [resource_id]);

	const closeModal = () => {
		setModalVisible(false);
		if (resource_id) {
			router.replace("/(app)/leaders");
		}
	};

	const thumbnail = getThumbnail(item);

	return (
		<>
			<TouchableOpacity
				className="w-48 bg-white border-border border rounded-[15px] mb-3 pb-2"
				onPress={() => setModalVisible(true)}
			>
				<View className="flex flex-col">
					{thumbnail ? (
						<Image
							source={{ uri: thumbnail }}
							className="w-full h-28 rounded-t-lg"
							resizeMode="cover"
						/>
					) : (
						<View className="w-full h-28 rounded-t-lg bg-gray-100 items-center justify-center">
							<Text className="text-gray-400 text-xs">
								No Preview
							</Text>
						</View>
					)}
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
								: item.youtube_link
									? "YouTube"
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
