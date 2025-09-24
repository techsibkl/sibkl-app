import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Notification = () => {
	return (
		<View className="flex-row justify-between items-center mt-5">
			<Text className="font-bold text-text text-xl">Notifications</Text>
			<TouchableOpacity>
				<Text className="text-text-tertiary, text-2xl">›</Text>
			</TouchableOpacity>
		</View>
	);
};

export default Notification;
