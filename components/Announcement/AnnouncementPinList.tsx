import { Announcement } from "@/services/Announcement/announcement.types";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { View } from "react-native";
import AnnouncementBanner from "../Home/AnnouncementBanner";
import SkeletonCarousel from "../shared/Skeleton/SkeletonCarousel";

type AnnouncementProps = {
	announcements: Announcement[];
};

const AnnouncementPinList = ({ announcements }: AnnouncementProps) => {
	return (
		<FlashList
			horizontal
			data={announcements}
			contentContainerStyle={{
				paddingHorizontal: 12,
			}}
			ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
			showsHorizontalScrollIndicator={false}
			renderItem={({ item: announcement }) => (
				<AnnouncementBanner announcement={announcement} />
			)}
			ListEmptyComponent={SkeletonCarousel}
			estimatedItemSize={100}
			className="mb-5"
			snapToInterval={350} // width of item + separator
			snapToAlignment="center"
			decelerationRate="fast"
		/>
	);
};

export default AnnouncementPinList;
