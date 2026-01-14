import NotificationList from "@/components/Home/NotificationList";
import SharedBody from "@/components/shared/SharedBody";
import { useNotificationQuery } from "@/hooks/Notifications/useNotificationsQuery";
import React, { useMemo, useState } from "react";

const NotificationsPage = () => {
	const { data } = useNotificationQuery();
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

	return (
		<SharedBody>
			<NotificationList />
		</SharedBody>
	);
};

export default NotificationsPage;
