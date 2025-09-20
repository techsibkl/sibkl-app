import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { Announcement } from "./announcement.types";

export const getAnnouncements = async (): Promise<Announcement[]> => {
	const response = await secureFetch(`${apiEndpoints.announcements.getAll}`);
	const json = await response.json();
	return json.data;
};
