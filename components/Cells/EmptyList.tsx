import { Users } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

const EmptyList = () => {
	return (
		<View className="flex-1 justify-center items-center py-24">
			<Users size={80} color="#666" />
			<Text className="text-2xl font-semibold  mt-5 mb-2">
				Not in a cell
			</Text>
			<Text className="text-base text-gray-400 text-center px-10 leading-6">
				Join a cell to connect with others and start your journey
				together
			</Text>
		</View>
	);
};

export default EmptyList;
