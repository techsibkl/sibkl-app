import { fetchNotifications } from "@/services/Notifications/notifications.service";
import { Notification } from "@/types/Notification.type";
import { useQuery } from "@tanstack/react-query";

export const useNotificationQuery = () => {
	return useQuery<Notification[]>({
		queryKey: ["notifications"],
		queryFn: () => fetchNotifications(),
	});
};
