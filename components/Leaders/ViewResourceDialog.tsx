import { MediaResource } from "@/services/Resource/resource.type";
import { Share2 } from "lucide-react-native";
import React from "react";
import {
	Image,
	Linking,
	Share,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type ViewResourceDialogProps = {
	resource: MediaResource;
};

const toYoutubeEmbedUrl = (url: string): string | null => {
	try {
		const u = new URL(url);
		if (u.hostname === "youtu.be") {
			return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
		}
		if (u.hostname.includes("youtube.com")) {
			const id = u.searchParams.get("v");
			if (id) return `https://www.youtube.com/embed/${id}`;
		}
		return null;
	} catch {
		return null;
	}
};

export const getThumbnail = (item: MediaResource): string | null => {
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

const ViewResourceDialog = ({ resource }: ViewResourceDialogProps) => {
	const embedUrl = resource.youtube_link
		? toYoutubeEmbedUrl(resource.youtube_link)
		: null;

	const handleItemPress = async (url: string) => {
		try {
			await Linking.openURL(url);
		} catch (error) {
			console.error("Error opening URL:", error);
		}
	};

	const handleShare = async () => {
		const share_url = resource.drive_view_link || resource.youtube_link;
		try {
			await Share.share({
				message: `${resource.title}\n\nDownload the resource here:`,
				url: share_url,
				title: resource.title,
			});
		} catch (error) {
			console.error("Error sharing:", error);
		}
	};

	const thumbnail = getThumbnail(resource);

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
						<Text className="text-gray-400 text-xs">
							No Preview
						</Text>
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

				{(resource.drive_view_link || resource.youtube_link) && (
					<View className="flex-row border-t mt-2 border-border">
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
								{resource.youtube_link ? "Watch" : "Open File"}
							</Text>
						</TouchableOpacity>

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
