import { Announcement } from "@/services/Announcement/announcement.types";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import EmptyList from "../Cells/EmptyList";
import AnnouncementCard from "./AnnouncementCard";

type AnnouncementAllListProps = {
	announcements: Announcement[];
};

const AnnouncementAllList = ({ announcements }: AnnouncementAllListProps) => {
	const { announcement_id } = useLocalSearchParams();
	const listRef = useRef<FlashList<Announcement>>(null);

	useEffect(() => {
		setTimeout(() => {
			if (announcement_id && announcements.length > 0) {
				const index = announcements.findIndex(
					(announcement) =>
						announcement.id === Number(announcement_id),
				);
				if (index !== -1 && listRef.current) {
					listRef.current.scrollToIndex({
						index,
						animated: true,
						viewOffset: 100,
					});
				}
			}
		}, 500);
	}, [announcement_id, announcements]);

	return (
		<FlashList
			ref={listRef}
			data={announcements}
			inverted
			contentContainerStyle={{
				paddingHorizontal: 16,
				paddingBottom: 16,
				paddingTop: 60,
			}}
			ItemSeparatorComponent={() => <View className="h-6" />}
			renderItem={({ item: announcement }) => (
				<AnnouncementCard announcement={announcement} />
			)}
			ListEmptyComponent={<EmptyList />}
			estimatedItemSize={100}
			className="pb-40"
		/>
	);
};

export default AnnouncementAllList;
