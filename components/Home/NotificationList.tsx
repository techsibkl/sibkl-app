import { Notification } from "@/types/Notification.type";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { RefreshControl, Text, TouchableOpacity, View } from "react-native";
import SkeletonList from "../shared/Skeleton/SkeletonList";
import NotificationItem from "./NotificationItem";

type NotificationListProps = {
	notifications: Notification[];
	onRefresh?: () => Promise<void>;
	isPending?: boolean;
	limited?: boolean;
};

const NotificationList = ({
	notifications,
	onRefresh,
	isPending,
	limited,
}: NotificationListProps) => {
	const router = useRouter();

	const [refreshing, setRefreshing] = useState(false);

	const handleRefresh = async () => {
		if (!onRefresh) return;
		setRefreshing(true);
		console.log("Refreshing people flow list...");
		await onRefresh();
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
				data={notifications}
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingVertical: 16,
				}}
				renderItem={({ item: notification }) => (
					<NotificationItem notification={notification} />
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
					(isPending && <SkeletonList length={5} />) || (
						<View className="h-full w-full items-center justify-center py-6">
							<Text className="text-gray-500 font-italic">
								No notifications yet. Pull to refresh...
							</Text>
						</View>
					)
				}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						colors={["#6b7280"]} // Android spinner color
						tintColor="#6b7280" // iOS spinner color
					/>
				}
			/>
		</View>
	);
};

export default NotificationList;
