import AnnouncementAllList from "@/components/Announcement/AnnouncementAllList";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useAnnouncementsQuery } from "@/hooks/Announcement/useAnnouncementsQuery";
import React, { useMemo, useState } from "react";

const AnnouncementsPage = () => {
	const { data: announcements, isPending } = useAnnouncementsQuery();
	const [searchQuery, setSearchQuery] = useState("");

	const filtered = useMemo(() => {
		const all = announcements || [];
		if (!searchQuery.trim()) return all;
		const q = searchQuery.toLowerCase();
		return all.filter(
			(a) =>
				a.title?.toLowerCase().includes(q) ||
				a.description?.toLowerCase().includes(q),
		);
	}, [announcements, searchQuery]);

	return (
		<SharedBody>
			<SharedSearchBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				placeholder="Search announcements..."
			/>
			<AnnouncementAllList announcements={filtered} />
		</SharedBody>
	);
};

export default AnnouncementsPage;
