import { MediaResource } from "@/services/Resource/resource.type";
import { toVimeoEmbedUrl } from "@/utils/vimeo";
import { Share2, Tv2Icon } from "lucide-react-native";
import React from "react";
import {
	Image,
	Linking,
	Share,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import ResourceThumbnail from "./ResourceThumbnail";
import { openVimeoFullscreen } from "./VimeoFullscreenHost";

type ViewResourceDialogProps = {
	resource: MediaResource;
};

const ViewResourceDialog = ({ resource }: ViewResourceDialogProps) => {
	const vimeoEmbedUrl = toVimeoEmbedUrl(resource.vimeo_link);

	const handleItemPress = async (url: string) => {
		try {
			await Linking.openURL(url);
		} catch (error) {
			console.error("Error opening URL:", error);
		}
	};

	const handleShare = async () => {
		const share_url =
			resource.drive_view_link ||
			resource.vimeo_link ||
			resource.youtube_link;
		try {
			await Share.share({
				// On Android, `url` is ignored — the link must be in `message`
				message: share_url
					? `${resource.title}\n\nDownload the resource here: ${share_url}`
					: resource.title,
				url: share_url,
				title: resource.title,
			});
		} catch (error) {
			console.error("Error sharing:", error);
		}
	};

	return (
		<View
			className="flex-row bg-white rounded-[15px] overflow-hidden items-center justify-between"
			style={{ shadowRadius: 5, shadowOpacity: 0.05 }}
		>
			<View className="flex-1">
				{resource.drive_file_id && !vimeoEmbedUrl ? (
					<Image
						source={{
							uri: `https://drive.google.com/thumbnail?id=${resource.drive_file_id}&sz=s1080`,
						}}
						className="w-full mb-3"
						style={{ aspectRatio: 16 / 9 }}
						resizeMode="cover"
					/>
				) : (
					<ResourceThumbnail
						resource={resource}
						className="w-full mb-3"
						style={{ aspectRatio: 16 / 9 }}
					/>
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

				{(resource.drive_view_link ||
					resource.youtube_link ||
					resource.vimeo_link) && (
					<View className="flex-row border-t mt-2 border-border">
						{vimeoEmbedUrl ? (
							<TouchableOpacity
								className="flex-1 py-6 items-center justify-center border-r border-border"
								onPress={() =>
									openVimeoFullscreen(
										vimeoEmbedUrl,
										resource.title,
									)
								}
							>
								<View className="flex-row items-center gap-2">
									<Tv2Icon size={16} color="#777" />
									<Text className="text-gray-500 font-semibold text-center">
										Watch
									</Text>
								</View>
							</TouchableOpacity>
						) : (
							(resource.drive_view_link ||
								resource.youtube_link) && (
								<TouchableOpacity
									className="flex-1 py-6 items-center justify-center border-r border-border"
									onPress={() =>
										handleItemPress(
											resource.drive_view_link ??
												resource.youtube_link!,
										)
									}
								>
									<Text className="text-gray-500 font-semibold">
										{resource.youtube_link
											? "Watch"
											: "Open File"}
									</Text>
								</TouchableOpacity>
							)
						)}

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
					</View>
				)}
			</View>
		</View>
	);
};

export default ViewResourceDialog;
