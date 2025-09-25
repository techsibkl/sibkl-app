import { useAuthStore } from "@/stores/authStore";
import React from "react";
import { Text, View } from "react-native";

const Greeting = () => {
	const { user } = useAuthStore();

	return (
		<View className="col">
			<Text className="font-bold mb-1 text-text text-3xl">
				Hi, {user?.person?.full_name}!
			</Text>
			<Text className="text-text-secondary text-lg">
				Welcome back to SIBKL App 🙌
			</Text>
		</View>
	);
};

export default Greeting;
