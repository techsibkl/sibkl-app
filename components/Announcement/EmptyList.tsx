import { MegaphoneIcon } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

const EmptyList = () => {
	return (
		<View className="flex-1 justify-center items-center py-24">
			<MegaphoneIcon size={80} color="#666" />
			<Text className="text-2xl font-bold text-text mt-5 mb-2">
				No announcements found
			</Text>
			<Text className="text-base text-gray-500 text-center px-10 leading-6">
				Please check back later for updates.
			</Text>
		</View>
	);
};

export default EmptyList;
