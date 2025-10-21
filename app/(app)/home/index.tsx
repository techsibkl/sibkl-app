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
	const { data: announcements, isPending } = useAnnouncementsQuery();
	const router = useRouter();

	const pinnedAnnouncements = useMemo(() => {
		return announcements?.filter((a) => a.pinned) || [];
	}, [announcements]);

	const notifications = [
		{
			id: 1,
			people_id: 101,
			name: "Sarah Chen",
			title: "New Guest",
			body: "Your workflow has been updated successfully",
			type: "flow" as const,
			ref_id: 2301,
			read_at: null,
			closed_at: null,
			created_at: "2024-08-14T10:28:00Z",
			timeAgo: "2 min ago",
		},
		{
			id: 2,
			people_id: 102,
			name: "Marcus Johnson",
			title: "New Team Member",
			body: "A new member has joined your team",
			type: "people" as const,
			ref_id: 1205,
			read_at: null,
			closed_at: null,
			created_at: "2024-08-14T10:25:00Z",
			timeAgo: "5 min ago",
		},
		{
			id: 3,
			people_id: 103,
			name: "Elena Rodriguez",
			title: "Cell Assignment",
			body: "You have been assigned to a new cell",
			type: "cell" as const,
			ref_id: 3401,
			read_at: null,
			closed_at: null,
			created_at: "2024-08-14T10:23:00Z",
			timeAgo: "7 min ago",
		},
		{
			id: 4,
			people_id: 104,
			name: "David Kim",
			title: "Duplicate Found",
			body: "Potential duplicate entry detected in your data",
			type: "duplicate" as const,
			ref_id: 5601,
			read_at: null,
			closed_at: null,
			created_at: "2024-08-14T10:18:00Z",
			timeAgo: "12 min ago",
		},
	];

	return (
		<SharedBody>
			<StatusBar
				className="bg-background dark:bg-background-dark"
				barStyle={isDark ? "light-content" : "dark-content"}
			/>

			{/* Featured Pinned Announcements */}
			<SharedSectionHeader
				title="Announcements"
				onPress={() => router.push("/(app)/announcements")}
			/>
			<AnnouncementPinList announcements={pinnedAnnouncements || []} />

			{/* Notification Section */}
			<SharedSectionHeader title="Notifications" onPress={() => {}} />
			<NotificationList notifications={notifications} />
		</SharedBody>
	);
};

export default DashboardScreen;
