import { ChevronRightIcon } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

const Notification = () => {
	return (
		<View className="flex-row justify-between items-center px-4 mb-3">
			<Text className="font-bold text-text text-xl">Notifications</Text>
			<View className="flex-grow"></View>
			<Text className="text-sm mr-1">See All</Text>
			<ChevronRightIcon size={16} />
		</View>
	);
};

export default Notification;
