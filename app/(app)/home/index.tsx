import AnnouncementPinList from "@/components/Announcement/AnnouncementPinList";
import ExploreGrid from "@/components/Home/ExploreGrid";
import ForYouSection from "@/components/Home/ForYouSection";
import LaunchBanner from "@/components/Home/LaunchBanner";
import QueryErrorState from "@/components/shared/QueryErrorState";
import SharedBody from "@/components/shared/SharedBody";
import SharedSectionHeader from "@/components/shared/SharedSectionHeader";
import { useExploreDestinations } from "@/config/exploreDestinations";
import { useAnnouncementsQuery } from "@/hooks/Announcement/useAnnouncementsQuery";
import { useNotificationQuery } from "@/hooks/Notifications/useNotificationsQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
	RefreshControl,
	ScrollView,
	StatusBar,
	View,
} from "react-native";

const DashboardScreen = () => {
	const router = useRouter();
	const { isDark } = useThemeColors();
	const exploreDestinations = useExploreDestinations();
	const [refreshing, setRefreshing] = useState(false);

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

	const handleRefresh = async () => {
		setRefreshing(true);
		await Promise.all([refetchAnnouncements(), refetchNotifications()]);
		setRefreshing(false);
	};

	return (
		<SharedBody>
			<StatusBar
				className="bg-white"
				barStyle={isDark ? "light-content" : "dark-content"}
			/>

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 24 }}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => void handleRefresh()}
						tintColor="#6b7280"
						colors={["#6b7280"]}
					/>
				}
			>
				<View className="pt-2">
					<LaunchBanner />
				</View>

				<ExploreGrid destinations={exploreDestinations} />

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

				<ForYouSection
					notifications={notifications}
					isPending={notificationsPending}
					isError={notificationsError}
					onRetry={() => void refetchNotifications()}
					isRetrying={notificationsFetching}
				/>
			</ScrollView>
		</SharedBody>
	);
};

export default DashboardScreen;
