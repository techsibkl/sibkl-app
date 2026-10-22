import NotificationList from "@/components/Home/NotificationList";
import QueryErrorState from "@/components/shared/QueryErrorState";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useNotificationQuery } from "@/hooks/Notifications/useNotificationsQuery";
import React, { useMemo, useState } from "react";
import { View } from "react-native";

const NotificationsPage = () => {
	const { data, isPending, isError, refetch, isFetching } =
		useNotificationQuery();
	const notifications = useMemo(() => data ?? [], [data]);

	const refresh = async () => {
		await refetch();
	};

	const [filter, setFilter] = useState<"all" | "unread" | "closed">("all");
	const [searchQuery, setSearchQuery] = useState("");

	const isNotificationRead = (notification: any) =>
		notification.read_at !== null;

	const isNotificationClosed = (notification: any) =>
		notification.closed_at !== null;

	const unreadCount = useMemo(
		() => notifications.filter((n) => !isNotificationRead(n)).length,
		[notifications],
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
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(n: any) =>
					n.title?.toLowerCase().includes(q) ||
					n.message?.toLowerCase().includes(q) ||
					n.body?.toLowerCase().includes(q),
			);
		}

		return filtered.sort((a, b) => {
			const aIsRead = isNotificationRead(a);
			const bIsRead = isNotificationRead(b);

			if (!aIsRead && bIsRead) return -1;
			if (aIsRead && !bIsRead) return 1;

			return (
				new Date(b.created_at).getTime() -
				new Date(a.created_at).getTime()
			);
		});
	}, [notifications, filter, searchQuery]);

	return (
		<SharedBody>
			<SharedSearchBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				placeholder="Search notifications..."
			/>
			<View className="flex-1 mt-4 ">
				{isError ? (
					<QueryErrorState
						onRetry={() => void refetch()}
						isRetrying={isFetching}
						title="Couldn't load notifications"
					/>
				) : (
					<NotificationList
						notifications={filteredNotifications}
						onRefresh={refresh}
						isPending={isPending}
					/>
				)}
			</View>
		</SharedBody>
	);
};

export default NotificationsPage;
