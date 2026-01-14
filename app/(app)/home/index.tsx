import AnnouncementPinList from "@/components/Announcement/AnnouncementPinList";
import NotificationList from "@/components/Home/NotificationList";
import SharedBody from "@/components/shared/SharedBody";
import SharedSectionHeader from "@/components/shared/SharedSectionHeader";
import { useAnnouncementsQuery } from "@/hooks/Announcement/useAnnouncementsQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StatusBar } from "react-native";

const DashboardScreen = () => {
	const { isDark } = useThemeColors();
	const { data: announcements } = useAnnouncementsQuery();
	const router = useRouter();

	const pinnedAnnouncements = useMemo(() => {
		return announcements?.filter((a) => a.pinned) || [];
	}, [announcements]);

	return (
		<SharedBody>
			<StatusBar
				className="bg-white"
				barStyle={isDark ? "light-content" : "dark-content"}
			/>

			{/* Featured Pinned Announcements */}
			<SharedSectionHeader
				title="Announcements"
				onPress={() => router.push("/(app)/announcements")}
			/>
			<AnnouncementPinList announcements={pinnedAnnouncements || []} />

			{/* Notification Section */}
			<SharedSectionHeader
				title="Notifications"
				onPress={() => router.push("/(app)/notifications")}
			/>
			<NotificationList limited={true} />
		</SharedBody>
	);
};

export default DashboardScreen;
