import { MediaResource } from "@/services/Resource/resource.type";
import { getResourceThumbnail, toVideoEmbedUrl } from "@/utils/videoEmbed";
import { router, type Href } from "expo-router";
import { Share2 } from "lucide-react-native";
import React from "react";
import { Image, Linking, Share, Text, TouchableOpacity, View } from "react-native";

type ViewResourceDialogProps = {
	resource: MediaResource;
};

export const getThumbnail = getResourceThumbnail;

const ViewResourceDialog = ({ resource }: ViewResourceDialogProps) => {
	const watchUrl = resource.vimeo_link || resource.youtube_link || "";
	const canWatch = !!toVideoEmbedUrl(watchUrl);
	const fileUrl = resource.drive_view_link;
	const shareUrl = watchUrl || fileUrl;

	const handleItemPress = async (url: string) => {
		try {
			await Linking.openURL(url);
		} catch (error) {
			console.error("Error opening URL:", error);
		}
	};

	const openPlayer = () => {
		router.push({
			pathname: "/(app)/leaders/player",
			params: { url: watchUrl, title: resource.title },
		} as unknown as Href);
	};

	const handleShare = async () => {
		try {
			await Share.share({
				message: shareUrl
					? `${resource.title}\n\n${canWatch ? "Watch it here" : "Download the resource here"}: ${shareUrl}`
					: resource.title,
				url: shareUrl,
				title: resource.title,
			});
		} catch (error) {
			console.error("Error sharing:", error);
		}
	};

	const thumbnail = getResourceThumbnail(resource);

	return (
		<View
			className="flex-row bg-white rounded-[15px] overflow-hidden items-center justify-between"
			style={{ shadowRadius: 5, shadowOpacity: 0.05 }}
		>
			<View className="flex-1">
				{resource.drive_file_id ? (
					<Image
						source={{
							uri: `https://drive.google.com/thumbnail?id=${resource.drive_file_id}&sz=s1080`,
						}}
						className="w-full mb-3"
						style={{ aspectRatio: 16 / 9 }}
						resizeMode="cover"
					/>
				) : thumbnail ? (
					<Image
						source={{ uri: thumbnail }}
						className="w-full mb-3"
						style={{ aspectRatio: 16 / 9 }}
						resizeMode="cover"
					/>
				) : (
					<View
						className="w-full bg-gray-100 items-center justify-center mb-3"
						style={{ aspectRatio: 16 / 9 }}
					>
						<Text className="text-gray-400 text-xs">No Preview</Text>
					</View>
				)}

				<View className="py-2 px-4">
					<Text
						className="text-text text-xl font-bold mb-1"
						numberOfLines={2}
						ellipsizeMode="tail"
					>
						{resource.title}
					</Text>
					<Text
						className="text-text text-base mb-1"
						numberOfLines={4}
						ellipsizeMode="tail"
					>
						{resource.description}
					</Text>
				</View>

				{(canWatch || fileUrl || shareUrl) && (
					<View className="flex-row border-t mt-2 border-border">
						{(canWatch || fileUrl) && (
							<TouchableOpacity
								className="flex-1 py-6 items-center justify-center border-r border-border"
								onPress={() =>
									canWatch ? openPlayer() : handleItemPress(fileUrl!)
								}
							>
								<Text className="text-gray-500 font-semibold">
									{canWatch ? "Watch" : "Open File"}
								</Text>
							</TouchableOpacity>
						)}

						{shareUrl && (
							<TouchableOpacity
								className="flex-1 py-6 items-center justify-center"
								onPress={handleShare}
							>
								<View className="flex-row items-center gap-2">
									<Share2 size={16} color="#777" />
									<Text className="text-gray-500 font-semibold">
										Share
									</Text>
								</View>
							</TouchableOpacity>
						)}
					</View>
				)}
			</View>
		</View>
	);
};

export default ViewResourceDialog;
