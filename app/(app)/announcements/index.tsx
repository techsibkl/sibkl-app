import AnnouncementAllList from "@/components/Announcement/AnnouncementAllList";
import SharedBody from "@/components/shared/SharedBody";
import { useAnnouncementsQuery } from "@/hooks/Announcement/useAnnouncementsQuery";
import React from "react";

const AnnouncementsPage = () => {
	const { data: announcements, isPending } = useAnnouncementsQuery();

	return (
		<SharedBody>
			<AnnouncementAllList announcements={announcements || []} />
		</SharedBody>
	);
};

export default AnnouncementsPage;
