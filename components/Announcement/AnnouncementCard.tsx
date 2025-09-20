import { Announcement } from "@/services/Announcement/announcement.types";
import { displayDateAsStr } from "@/utils/helper";
import { Calendar1Icon, MapPinIcon } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
    Dimensions,
    Image,
    Image as RNImage,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type AnnouncementCardProps = {
	announcement: Announcement;
};

const AnnouncementCard = ({ announcement }: AnnouncementCardProps) => {
	const [imageHeight, setImageHeight] = useState(200); // fallback height
	const screenWidth = Dimensions.get("window").width;

	useEffect(() => {
		if (!announcement.drive_file_id) return;
		const imageUri = `https://drive.google.com/thumbnail?id=${announcement.drive_file_id}`;

		RNImage.getSize(
			imageUri,
			(width, height) => {
				// Calculate height based on screen width maintaining aspect ratio
				const calculatedHeight = (height * screenWidth) / width;

				// Optional: Set min/max constraints like WhatsApp
				const minHeight = 150;
				const maxHeight = 400;

				const finalHeight = Math.min(
					Math.max(calculatedHeight, minHeight),
					maxHeight
				);
				setImageHeight(finalHeight);
			},
			(error) => {
				console.log("Error getting image size:", error);
				setImageHeight(200); // fallback
			}
		);
	}, [announcement.drive_file_id]);

	// Computed property for date display
	const dateDisplay = useMemo(() => {
		if (!announcement.date_start && !announcement.date_end) {
			return null;
		}

		if (announcement.date_start && announcement.date_end) {
			return `${displayDateAsStr(announcement.date_start)} - ${displayDateAsStr(announcement.date_start)}`;
		}

		if (announcement.date_start) {
			return displayDateAsStr(announcement.date_start);
		}

		if (announcement.date_end) {
			return `Ends: ${displayDateAsStr(announcement.date_end)}`;
		}
	}, [announcement.date_start, announcement.date_end]);
	return (
		<TouchableOpacity
			className="flex-row bg-white rounded-lg p-1 items-center justify-between"
			style={{
				shadowRadius: 5, // Override the default blur
				shadowOpacity: 0.05,
			}}
			onPress={() => {}}
		>
			<View className="flex-1">
				{announcement.drive_file_id && (
					<Image
						source={{
							uri: `https://drive.google.com/thumbnail?id=${announcement.drive_file_id}`,
						}}
						className="w-full rounded-lg mb-3"
						style={{ height: imageHeight }}
						resizeMode="cover"
					/>
				)}
				<View className="p-2">
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
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
};

export default AnnouncementCard;
