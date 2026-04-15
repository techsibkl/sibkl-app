import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { useAuthStore } from "@/stores/authStore";
import { getInitials } from "@/utils/helper_profile";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Greeting = () => {
	const router = useRouter();
	const { user } = useAuthStore();
	const { data: currentPerson, isPending } = useSinglePersonQuery(
		user?.person?.id ?? -1,
	);

	return (
		<View className="w-full flex-row justify-between items-start">
			<View className="col flex-1">
				<Text
					className="font-bold mb-1 text-text text-2xl pr-4"
					numberOfLines={2}
				>
					Hi, {currentPerson?.full_legal_name}!
				</Text>
				<Text className="text-text-secondary text-lg font-regular">
					Welcome back to SIBKL App 🙌
				</Text>
			</View>
			<TouchableOpacity
				onPress={() => router.push("/(app)/home/profile")}
			>
				{/* Color-coded avatar with initials */}
				<View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center">
					<Text className="text-sm font-bold">
						{getInitials(currentPerson?.full_legal_name)}
					</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
};

export default Greeting;
