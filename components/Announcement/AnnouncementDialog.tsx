import { Announcement } from "@/services/Announcement/announcement.types";
import { displayDateAsStr } from "@/utils/helper";
import { Calendar1Icon, LinkIcon, MapPinIcon } from "lucide-react-native";
import React, { useMemo } from "react";
import { Image, Linking, Text, TouchableOpacity, View } from "react-native";

type AnnouncementDialogProps = {
	announcement: Announcement;
};

const AnnouncementDialog = ({ announcement }: AnnouncementDialogProps) => {
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
						numberOfLines={4}
						ellipsizeMode="tail"
					>
						{announcement.description}
					</Text>
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
				{announcement.cta_link && (
					<TouchableOpacity
						className="border-t mt-2 py-6 items-center justify-center w-full border-border"
						onPress={() => handleItemPress(announcement.cta_link!)}
					>
						<Text className="text-gray-500 font-semibold">
							View More
						</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

export default AnnouncementDialog;
