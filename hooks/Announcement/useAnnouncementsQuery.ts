import { getAnnouncements } from "@/services/Announcement/announcement.service";
import { Announcement } from "@/services/Announcement/announcement.types";
import { useQuery } from "@tanstack/react-query";

export const useAnnouncementsQuery = () => {
	return useQuery<Announcement[]>({
		queryKey: ["announcements"],
		queryFn: getAnnouncements,
	});
};
