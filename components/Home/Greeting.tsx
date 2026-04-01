import { useSinglePersonQuery } from "@/hooks/People/useSinglePersonQuery";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const Greeting = () => {
	const router = useRouter();
	const { user } = useAuthStore();
	const { data: currentPerson, isPending } = useSinglePersonQuery(
		user?.people_id,
	);

	return (
		<View className="w-full flex-row justify-between items-start">
			<View className="col flex-1">
				<Text
					className="font-bold mb-1 text-text text-3xl pr-4"
					numberOfLines={2}
				>
					Hi, {currentPerson?.full_name}!
				</Text>
				<Text className="text-text-secondary text-lg font-regular">
					Welcome back to SIBKL App 🙌
				</Text>
			</View>
			<TouchableOpacity
				onPress={() => router.push("/(app)/home/profile")}
			>
				<Image
					source={require("../../assets/images/person.png")}
					className="w-14 h-14 rounded-xl"
					resizeMode="contain"
				/>
			</TouchableOpacity>
		</View>
	);
};

export default Greeting;
