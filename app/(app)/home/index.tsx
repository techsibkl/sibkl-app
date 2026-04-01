import AnnouncementPinList from "@/components/Announcement/AnnouncementPinList";
import NotificationList from "@/components/Home/NotificationList";
import SharedBody from "@/components/shared/SharedBody";
import SharedSectionHeader from "@/components/shared/SharedSectionHeader";
import { useAnnouncementsQuery } from "@/hooks/Announcement/useAnnouncementsQuery";
import { useNotificationQuery } from "@/hooks/Notifications/useNotificationsQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StatusBar } from "react-native";

const DashboardScreen = () => {
	const router = useRouter();
	const { isDark } = useThemeColors();
	const { data: announcements } = useAnnouncementsQuery();
	const { data, isPending, refetch } = useNotificationQuery();

	const pinnedAnnouncements = useMemo(() => {
		return announcements?.filter((a) => a.pinned) || [];
	}, [announcements]);

	const notifications = useMemo(() => data || [], [data]);

	const refresh = async () => {
		await refetch();
	};

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
			<NotificationList
				notifications={notifications.slice(0, 5)}
				onRefresh={refresh}
				isPending={isPending}
				limited
			/>
		</SharedBody>
	);
};

export default DashboardScreen;
