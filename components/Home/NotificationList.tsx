import { FlashList } from "@shopify/flash-list";
import React from "react";
import { Text, View } from "react-native";

type NotificationListProps = {
	notifications: any[];
};

const NotificationList = ({ notifications }: NotificationListProps) => {
	return (
		<View
			className="flex-row h-full mx-4 bg-white rounded-[15px] items-center justify-between"
			style={{
				shadowRadius: 5, // Override the default blur
				shadowOpacity: 0.05,
			}}
		>
			<FlashList
				data={notifications}
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingVertical: 8,
				}}
				renderItem={({ item: notification }) => (
					<View
						key={notification.id}
						className="flex-row justify-between notifications-center py-4 border-border dark:border-border-dark border-b"
					>
						<View className="flex-1 gap-y-1">
							<Text className="text-text-tertiary text-xs">
								{notification.timeAgo}
							</Text>
							<Text className="font-semibold text-text">
								{notification.title}
							</Text>
							<Text className="text-text-tertiary text-xs">
								{notification.type}
							</Text>
						</View>
					</View>
				)}
			/>
		</View>
	);
};

export default NotificationList;
