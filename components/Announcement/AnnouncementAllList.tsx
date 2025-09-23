import { Announcement } from "@/services/Announcement/announcement.types";
import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";
import EmptyList from "../Cells/EmptyList";
import AnnouncementCard from "./AnnouncementCard";

type AnnouncementAllListProps = {
	announcements: Announcement[];
};

const AnnouncementAllList = ({ announcements }: AnnouncementAllListProps) => {
	
	return (
		<FlashList
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
