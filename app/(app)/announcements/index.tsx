import AnnouncementAllList from "@/components/Announcement/AnnouncementAllList";
import { useAnnouncementsQuery } from "@/hooks/Announcement/useAnnouncementsQuery";
import React from "react";
import { View } from "react-native";

const AnnouncementsPage = () => {
	const { data: announcements, isPending } = useAnnouncementsQuery();

	return (
		<View className="flex-1 bg-background dark:bg-background-dark">
			<AnnouncementAllList announcements={announcements || []} />
		</View>
	);
};

export default AnnouncementsPage;
