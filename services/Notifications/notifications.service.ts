import { Notification } from "@/types/Notification.type";
import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";

// Fetch all the user's notifications
export const fetchNotifications = async (): Promise<Notification[]> => {
	const response = await secureFetch(`${apiEndpoints.notifications.getAll}`);
	const json: ReturnVal = await response.json();
	return json.data as Notification[];
};

// Mark specific notifications as read
export const updateNotificationsAsRead = async (ids: number[]) => {
	const response = await secureFetch(
		apiEndpoints.notifications.updateAsRead,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ids }),
		}
	);
	return await response.json();
};

// Close notifications
export const updateNotificationsAsClosed = async (ids: number[]) => {
	const response = await secureFetch(
		apiEndpoints.notifications.updateAsClosed,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ids }),
		}
	);
	return await response.json();
};
