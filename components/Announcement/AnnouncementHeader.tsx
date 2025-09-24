import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AnnouncementHeader = () => {
	const router = useRouter();
	return (
		<SafeAreaView
			edges={{ bottom: "off", top: "additive" }}
			className="flex flex-row pb-2 px-2 gap-x-2 items-center bg-background"
		>
			<TouchableOpacity onPress={() => router.back()}>
				<ChevronLeft size={28} />
			</TouchableOpacity>
			<Text className="text-xl font-bold">All Announcements</Text>
		</SafeAreaView>
	);
};

export default AnnouncementHeader;
