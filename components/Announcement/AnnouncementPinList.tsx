import { Announcement } from "@/services/Announcement/announcement.types";
import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";
import AnnouncementBanner from "../Home/AnnouncementBanner";

type AnnouncementProps = {
	announcements: Announcement[];
};

const AnnouncementPinList = ({ announcements }: AnnouncementProps) => {
	return (
		<FlashList
			horizontal
			data={announcements}
			ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
			showsHorizontalScrollIndicator={false}
			renderItem={({ item: announcement }) => (
				<AnnouncementBanner announcement={announcement} />
			)}
			ListEmptyComponent={<View className="w-96 aspect-video"></View>}
			estimatedItemSize={100}
			className="mb-5"
			snapToInterval={350} // width of item + separator
			snapToAlignment="center"
			decelerationRate="fast"
		/>
	);
};

export default AnnouncementPinList;
