import AnnouncementAllList from "@/components/Announcement/AnnouncementAllList";
import QueryErrorState from "@/components/shared/QueryErrorState";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import SkeletonList from "@/components/shared/Skeleton/SkeletonList";
import { useAnnouncementsQuery } from "@/hooks/Announcement/useAnnouncementsQuery";
import React, { useMemo, useState } from "react";

const AnnouncementsPage = () => {
	const {
		data: announcements,
		isPending,
		isError,
		refetch,
		isFetching,
	} = useAnnouncementsQuery();
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

	const handleRetry = () => {
		void refetch();
	};

	return (
		<SharedBody>
			<SharedSearchBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				placeholder="Search announcements..."
			/>
			{isPending ? (
				<SkeletonList length={5} />
			) : isError ? (
				<QueryErrorState
					onRetry={handleRetry}
					isRetrying={isFetching}
					title="Couldn't load announcements"
				/>
			) : (
				<AnnouncementAllList announcements={filtered} />
			)}
		</SharedBody>
	);
};

export default AnnouncementsPage;
