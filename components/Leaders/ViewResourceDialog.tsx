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

const ViewResourceDialog = ({ resource }: ViewResourceDialogProps) => {
	const handleItemPress = async (url: string) => {
		try {
			await Linking.openURL(url);
		} catch (error) {
			console.error("Error opening URL:", error);
		}
	};

	const handleShare = async () => {
		if (!resource.drive_view_link) return;
		try {
			await Share.share({
				message: `${resource.title}\n${resource.description}\n\nDownload the resource here: ${resource.drive_view_link}`,
				url: resource.drive_view_link, // iOS-specific, still nice to include
				title: resource.title,
			});
		} catch (error) {
			console.error("Error sharing:", error);
		}
	};

	return (
		<View
			className="flex-row bg-white rounded-[15px] overflow-hidden items-center justify-between"
			style={{
				shadowRadius: 5, // Override the default blur
				shadowOpacity: 0.05,
			}}
		>
			<View className="flex-1">
				{resource.drive_file_id && (
					<Image
						source={{
							uri: `https://drive.google.com/thumbnail?id=${resource.drive_file_id}&sz=s1080`,
						}}
						className="w-full  mb-3"
						style={{ aspectRatio: 16 / 9 }}
						resizeMode="cover"
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
				{resource.drive_view_link && (
					<View className="flex-row border-t mt-2 border-border">
						{/* Open File */}
						<TouchableOpacity
							className="flex-1 py-6 items-center justify-center border-r border-border"
							onPress={() =>
								handleItemPress(resource.drive_view_link!)
							}
						>
							<Text className="text-gray-500 font-semibold">
								Open File
							</Text>
						</TouchableOpacity>

						{/* Share */}
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
