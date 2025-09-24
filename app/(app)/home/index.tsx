import AnnouncementPinList from "@/components/Announcement/AnnouncementPinList";
import Greeting from "@/components/Home/Greeting";
import Header from "@/components/Home/Header";
import Notification from "@/components/Home/Notification";
import NotificationList from "@/components/Home/NotificationList";
import { useAnnouncementsQuery } from "@/hooks/Announcement/useAnnouncementsQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import { ChevronRightIcon } from "lucide-react-native";
import { useMemo } from "react";
import {
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
			title: "Flow Update",
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
		<SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
			<StatusBar
				className="bg-background dark:bg-background-dark"
				barStyle={isDark ? "light-content" : "dark-content"}
			/>

			{/* Header */}
			<Header />

			<ScrollView
				className="flex-1 px-5"
				showsVerticalScrollIndicator={false}
			>
				{/* Greeting */}
				<Greeting />

				{/* Featured Pinned Announcements */}
				<TouchableOpacity
					onPress={() => router.push("/(app)/announcements")}
				>
					<View className="flex-row justify-between items-center mb-5">
						<Text className="font-bold text-text text-xl">
							Announcements
						</Text>
						<View className="flex-grow"></View>
						<Text className="text-sm mr-1">See All</Text>
						<ChevronRightIcon size={16} />
					</View>
				</TouchableOpacity>
				<AnnouncementPinList
					announcements={pinnedAnnouncements || []}
				/>

				{/* Notification Section */}
				<Notification />
				<NotificationList notifications={notifications} />
			</ScrollView>
		</SafeAreaView>
	);
};

export default DashboardScreen;
