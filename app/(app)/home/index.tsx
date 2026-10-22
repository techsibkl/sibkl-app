import AnnouncementPinList from "@/components/Announcement/AnnouncementPinList";
import LaunchBanner from "@/components/Home/LaunchBanner";
import NotificationList from "@/components/Home/NotificationList";
import QueryErrorState from "@/components/shared/QueryErrorState";
import SharedBody from "@/components/shared/SharedBody";
import SharedSectionHeader from "@/components/shared/SharedSectionHeader";
import { useAnnouncementsQuery } from "@/hooks/Announcement/useAnnouncementsQuery";
import { useNotificationQuery } from "@/hooks/Notifications/useNotificationsQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StatusBar, View } from "react-native";

const DashboardScreen = () => {
	const router = useRouter();
	const { isDark } = useThemeColors();
	const {
		data: announcements,
		isPending: announcementsPending,
		isError: announcementsError,
		refetch: refetchAnnouncements,
		isFetching: announcementsFetching,
	} = useAnnouncementsQuery();
	const {
		data,
		isPending: notificationsPending,
		isError: notificationsError,
		refetch: refetchNotifications,
		isFetching: notificationsFetching,
	} = useNotificationQuery();

	const pinnedAnnouncements = useMemo(() => {
		return announcements?.filter((a) => a.pinned) || [];
	}, [announcements]);

	const notifications = useMemo(() => data || [], [data]);

	const refreshNotifications = async () => {
		await refetchNotifications();
	};

	return (
		<SharedBody>
			<StatusBar
				className="bg-white"
				barStyle={isDark ? "light-content" : "dark-content"}
			/>

			<LaunchBanner />

			<SharedSectionHeader
				title="Announcements"
				onPress={() => router.push("/(app)/announcements")}
			/>
			{announcementsError ? (
				<View className="min-h-[120px] mb-2">
					<QueryErrorState
						onRetry={() => void refetchAnnouncements()}
						isRetrying={announcementsFetching}
						title="Couldn't load announcements"
					/>
				</View>
			) : (
				<AnnouncementPinList
					announcements={pinnedAnnouncements}
					isPending={announcementsPending}
				/>
			)}

			<SharedSectionHeader
				title="Notifications"
				onPress={() => router.push("/(app)/notifications")}
			/>
			{notificationsError ? (
				<View className="min-h-[160px]">
					<QueryErrorState
						onRetry={() => void refetchNotifications()}
						isRetrying={notificationsFetching}
						title="Couldn't load notifications"
					/>
				</View>
			) : (
				<NotificationList
					notifications={notifications.slice(0, 5)}
					onRefresh={refreshNotifications}
					isPending={notificationsPending}
					limited
				/>
			)}
		</SharedBody>
	);
};

export default DashboardScreen;
