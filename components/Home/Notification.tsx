import { Colors } from "@/constants/Colors";
import { Notification } from "@/types/Notification.type";
import { BellIcon, ClockIcon, UserIcon } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

type Props = {
	notification: Notification;
};

// Format the time
const formatTimeAgo = (dateString: string) => {
	const date = new Date(dateString);
	const now = new Date();
	const diffInMinutes = Math.floor(
		(now.getTime() - date.getTime()) / (1000 * 60)
	);

	if (diffInMinutes < 1) return "Just now";
	if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) return `${diffInHours}h ago`;

	const diffInDays = Math.floor(diffInHours / 24);
	return `${diffInDays}d ago`;
};

const NotificationItem = ({ notification }: Props) => {
	return (
		<View
			key={notification.id}
			className="flex-row justify-between py-4 gap-4 border-b border-border"
		>
			<View
				className="flex items-center justify-center mt-0.5 w-10 h-10 rounded-full flex-shrink-0"
				style={{
					backgroundColor:
						notification.type === "flow"
							? Colors.secondary[100]
							: "#fff0db",
				}}
			>
				{notification.type === "flow" ? (
					<UserIcon size={18} color={Colors.secondary[500]} />
				) : (
					<BellIcon size={18} color="#fb9c0f" />
				)}
			</View>
			<View className="flex-1 gap-y-1">
				<Text className="font-semibold">{notification.title}</Text>
				<Text className="font-light text-sm">{notification.body}</Text>
				<View className="flex flex-row mt-2 w-full gap-3 items-center justify-between">
					<View className="px-2 py-1 rounded-full flex-row items-center gap-1 self-start bg-gray-100">
						<Text className="font-semibold text-xs">
							{notification.type}
						</Text>
					</View>
					<View className="flex flex-row items-center gap-1">
						<ClockIcon size={12} color={Colors.gray[400]} />
						<Text className="font-light text-gray-400 text-xs">
							{formatTimeAgo(notification.created_at)}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
};

export default NotificationItem;
