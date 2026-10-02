import { Announcement } from "@/services/Announcement/announcement.types";
import { displayDateAsStr } from "@/utils/helper";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
	Calendar1Icon,
	LinkIcon,
	MapPinIcon,
	Share2,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
	ActivityIndicator,
	Image,
	Linking,
	Platform,
	Share,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type AnnouncementDialogProps = {
	announcement: Announcement;
};

const AnnouncementDialog = ({ announcement }: AnnouncementDialogProps) => {
	const [descriptionExpanded, setDescriptionExpanded] = useState(false);
	const [isSharing, setIsSharing] = useState(false);
	const handleItemPress = async (url: string) => {
		try {
			await Linking.openURL(url);
		} catch (error) {
			console.error("Error opening URL:", error);
		}
	};

	// Computed property for date display
	const dateDisplay = useMemo(() => {
		if (!announcement.date_start && !announcement.date_end) {
			return null;
		}

		if (announcement.date_start && announcement.date_end) {
			return `${displayDateAsStr(announcement.date_start)} - ${displayDateAsStr(announcement.date_end)}`;
		}

		if (announcement.date_start) {
			return displayDateAsStr(announcement.date_start);
		}

		if (announcement.date_end) {
			return `Ends: ${displayDateAsStr(announcement.date_end)}`;
		}
	}, [announcement.date_start, announcement.date_end]);

	const handleShare = async () => {
		if (isSharing) return;
		setIsSharing(true);

		const parts: string[] = [announcement.title];
		if (announcement.description) {
			parts.push(`\n${announcement.description}`);
		}
		if (dateDisplay) {
			parts.push(`\n📅 ${dateDisplay}`);
		}
		if (announcement.location) {
			parts.push(`📍 ${announcement.location}`);
		}
		if (announcement.cta_link) {
			parts.push(`\n🔗 ${announcement.cta_link}`);
		}
		const message = parts.join("\n");

		try {
			if (announcement.drive_file_id) {
				const imageUrl = `https://drive.google.com/thumbnail?id=${announcement.drive_file_id}&sz=s1080`;
				const localPath = `${FileSystem.cacheDirectory}announcement-${announcement.drive_file_id}.jpg`;

				try {
					const { uri } = await FileSystem.downloadAsync(
						imageUrl,
						localPath,
					);

					if (Platform.OS === "ios") {
						// iOS: share sheet accepts a local file URI + message text together
						await Share.share({
							url: uri,
							message,
							title: announcement.title,
						});
					} else {
						// Android: share the image file via Sharing.shareAsync
						const available = await Sharing.isAvailableAsync();
						if (available) {
							await Sharing.shareAsync(uri, {
								mimeType: "image/jpeg",
								dialogTitle: announcement.title,
								UTI: "public.jpeg",
							});
						} else {
							// Fallback: text-only
							await Share.share({
								message,
								title: announcement.title,
							});
						}
					}
					return;
				} catch (imgErr) {
					console.error(
						"Image download failed, falling back to text share:",
						imgErr,
					);
				}
			}

			// No image or download failed — text-only share
			await Share.share({
				message,
				url: announcement.cta_link,
				title: announcement.title,
			});
		} catch (error) {
			console.error("Error sharing:", error);
		} finally {
			setIsSharing(false);
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
				{announcement.drive_file_id && (
					<Image
						source={{
							uri: `https://drive.google.com/thumbnail?id=${announcement.drive_file_id}&sz=s1080`,
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
						{announcement.title}
					</Text>
					<Text
						className="text-text text-base mb-1"
						numberOfLines={descriptionExpanded ? undefined : 4}
						ellipsizeMode="tail"
					>
						{announcement.description}
					</Text>
					{announcement.description &&
						announcement.description.length > 0 && (
							<TouchableOpacity
								onPress={() =>
									setDescriptionExpanded((prev) => !prev)
								}
								className="mb-1"
							>
								<Text className="text-secondary-500 text-sm font-semibold">
									{descriptionExpanded
										? "Read less"
										: "Read more..."}
								</Text>
							</TouchableOpacity>
						)}
					{/* Date and Location Info */}
					<View className="mt-2 gap-1">
						{dateDisplay && (
							<View className="flex-row items-center">
								<Calendar1Icon size={14} color="#6B7280" />
								<Text className="text-gray-500 text-sm ml-2">
									Date: {dateDisplay}
								</Text>
							</View>
						)}

						{announcement.location && (
							<View className="flex-row items-center">
								<MapPinIcon size={14} color="#6B7280" />
								<Text className="text-gray-500 text-sm ml-2">
									{announcement.location}
								</Text>
							</View>
						)}

						{announcement.cta_link && (
							<View className="flex-row items-center">
								<LinkIcon size={14} color="#6B7280" />
								<Text
									onPress={() =>
										handleItemPress(announcement.cta_link!)
									}
									className="text-blue-500 text-sm ml-2
										hover:underline"
								>
									{announcement.cta_link}
								</Text>
							</View>
						)}
					</View>
				</View>
				<View className="flex-row border-t mt-2 border-border">
					{announcement.cta_link && (
						<TouchableOpacity
							className="flex-1 py-6 items-center justify-center border-r border-border"
							onPress={() =>
								handleItemPress(announcement.cta_link!)
							}
						>
							<Text className="text-gray-500 font-semibold">
								Open Link
							</Text>
						</TouchableOpacity>
					)}
					<TouchableOpacity
						className="flex-1 py-6 items-center justify-center"
						onPress={handleShare}
						disabled={isSharing}
					>
						<View className="flex-row items-center gap-2">
							{isSharing ? (
								<ActivityIndicator size="small" color="#777" />
							) : (
								<>
									<Share2 size={16} color="#777" />
									<Text className="text-gray-500 font-semibold">
										Share
									</Text>
								</>
							)}
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

export default AnnouncementDialog;
