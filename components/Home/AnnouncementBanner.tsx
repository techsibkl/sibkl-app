import { Announcement } from "@/services/Announcement/announcement.types";
import React, { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import AnnouncementDialog from "../Announcement/AnnouncementDialog";
import SharedModal from "../shared/SharedModal";

type AnnouncementBannerProps = {
	announcement: Announcement;
};
const AnnouncementBanner = ({ announcement }: AnnouncementBannerProps) => {
	const [modalVisible, setModalVisible] = useState(false);

	return (
		<>
			<TouchableOpacity onPress={() => setModalVisible(true)}>
				<View className="rounded-xl w-96 aspect-video shadow-sm">
					<Image
						source={{
							uri: `https://drive.google.com/thumbnail?id=${announcement.drive_file_id}&sz=s1080`,
						}}
						className="w-full h-full rounded-[15px] mb-3"
						resizeMode="cover"
					/>
				</View>
			</TouchableOpacity>
			<SharedModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			>
				<AnnouncementDialog announcement={announcement} />
			</SharedModal>
		</>
	);
};

export default AnnouncementBanner;
