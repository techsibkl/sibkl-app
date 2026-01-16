import { useNotificationQuery } from "@/hooks/Notifications/useNotificationsQuery";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { RefreshControl, Text, TouchableOpacity, View } from "react-native";
import Notification from "./Notification";

type NotificationListProps = {
	limited?: boolean;
};

const NotificationList = ({ limited }: NotificationListProps) => {
	const router = useRouter();

	const { data, refetch } = useNotificationQuery();
	const notifications = data || [];

	const [filter, setFilter] = useState<"all" | "unread" | "closed">("all");

	// Helper function to check if notification is read
	const isNotificationRead = (notification: any) =>
		notification.read_at !== null;

	// Helper function to check if notification is closed
	const isNotificationClosed = (notification: any) =>
		notification.closed_at !== null;

	const unreadCount = useMemo(
		() => notifications.filter((n) => !isNotificationRead(n)).length,
		[notifications]
	);

	const filteredNotifications = useMemo(() => {
		let filtered = notifications.filter((n) => !isNotificationClosed(n));
		switch (filter) {
			case "unread":
				filtered = filtered.filter((n) => !isNotificationRead(n));
				break;
			case "closed":
				filtered = notifications.filter((n) => isNotificationClosed(n));
				break;
		}
		// Sort by created_at (newest first), with unread notifications prioritized
		return filtered.sort((a, b) => {
			const aIsRead = isNotificationRead(a);
			const bIsRead = isNotificationRead(b);

			// Unread notifications come first
			if (!aIsRead && bIsRead) return -1;
			if (aIsRead && !bIsRead) return 1;

			// Then sort by creation time (newest first)
			return (
				new Date(b.created_at).getTime() -
				new Date(a.created_at).getTime()
			);
		});
	}, [notifications, filter]);

	const [refreshing, setRefreshing] = useState(false);

	const handleRefresh = async () => {
		setRefreshing(true);
		console.log("Refreshing people flow list...");
		await refetch();
		setRefreshing(false);
		console.log("Refresh complete.");
	};

	return (
		<View
			className="flex-row flex-1 h-full mx-4 bg-white rounded-t-[15px] items-center justify-between"
			style={{
				shadowRadius: 5, // Override the default blur
				shadowOpacity: 0.05,
			}}
		>
			<FlashList
				data={
					limited ? notifications.splice(0, 5) : filteredNotifications
				}
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingVertical: 16,
				}}
				renderItem={({ item: notification }) => (
					<Notification notification={notification} />
				)}
				ListFooterComponent={
					<>
						{notifications.length > 0 && limited && (
							<TouchableOpacity
								className="flex flex-row w-full items-center justify-center py-6"
								onPress={() =>
									router.push("/(app)/notifications")
								}
							>
								<Text className="text-gray-500 italic">
									Read more...
								</Text>
							</TouchableOpacity>
						)}
					</>
				}
				ListEmptyComponent={
					<View className="h-full w-full items-center justify-center py-6">
						<Text className="text-gray-500 font-italic">
							No notifications yet. Pull to refresh...
						</Text>
					</View>
				}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						size={12}
						colors={["#3B82F6"]} // Android spinner color
						tintColor="#3B82F6" // iOS spinner color
					/>
				}
			/>
		</View>
	);
};

export default NotificationList;
