import { Announcement } from "@/services/Announcement/announcement.types";
import React, { useState } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import AnnouncementDialog from "../Announcement/AnnouncementDialog";

type AnnouncementBannerProps = {
	announcement: Announcement;
};
const AnnouncementBanner = ({ announcement }: AnnouncementBannerProps) => {
	const [modalVisible, setModalVisible] = useState(false);

	const openModal = () => setModalVisible(true);
	const closeModal = () => setModalVisible(false);

	return (
		<>
			<TouchableOpacity onPress={openModal}>
				<View className="rounded-xl shadow-sm w-96 aspect-video">
					<Image
						source={{
							uri: `https://drive.google.com/thumbnail?id=${announcement.drive_file_id}&sz=s1080`,
						}}
						className="w-full h-full rounded-lg mb-3"
						resizeMode="cover"
					/>
				</View>
			</TouchableOpacity>
			<Modal
				animationType="fade"
				transparent={true}
				visible={modalVisible}
				onRequestClose={closeModal}
			>
				<View className="flex-1 justify-center items-center bg-black/50">
					<View className="relative m-4 max-w-sm w-full max-h-4/5 ">
						{/* Hovering close button */}
						<TouchableOpacity
							onPress={closeModal}
							className="absolute top-2 right-2 z-10 bg-white/80 rounded-full w-8 h-8 justify-center items-center"
						>
							<Text className="text-gray-700 text-lg">✕</Text>
						</TouchableOpacity>

						<AnnouncementDialog announcement={announcement} />
					</View>
				</View>
			</Modal>
		</>
	);
};

export default AnnouncementBanner;
