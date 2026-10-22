import { SkeletonRow } from "@/components/shared/Skeleton/SkeletonRow";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { useAuthStore } from "@/stores/authStore";
import { getInitials } from "@/utils/helper_profile";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Greeting = () => {
	const router = useRouter();
	const { user, isGuest } = useAuthStore();
	const personId = user?.person?.id ?? -1;
	const { data: currentPerson, isPending, isError } = useSinglePersonQuery(
		personId,
	);

	if (isGuest) {
		return (
			<View className="w-full flex-row justify-between items-start">
				<View className="col flex-1">
					<Text
						className="font-bold mb-1 text-text text-2xl pr-4"
						numberOfLines={2}
					>
						Welcome, Guest!
					</Text>
					<Text className="text-text-secondary text-lg font-regular">
						Browse announcements and resources 🙌
					</Text>
				</View>
				<TouchableOpacity
					onPress={() => router.push("/(app)/home/profile")}
				>
					<View className="w-14 h-14 rounded-full bg-gray-300 items-center justify-center">
						<Text className="text-sm font-bold text-gray-600">
							G
						</Text>
					</View>
				</TouchableOpacity>
			</View>
		);
	}

	const displayName =
		isError || !currentPerson?.full_legal_name
			? "Hi!"
			: `Hi, ${currentPerson.full_legal_name}!`;

	return (
		<View className="w-full flex-row justify-between items-start">
			<View className="col flex-1">
				{isPending && personId > 0 ? (
					<View className="mb-1">
						<SkeletonRow width={180} height={28} borderRadius={6} />
					</View>
				) : (
					<Text
						className="font-bold mb-1 text-text text-2xl pr-4"
						numberOfLines={2}
					>
						{displayName}
					</Text>
				)}
				<Text className="text-text-secondary text-lg font-regular">
					Welcome back to SIBKL App 🙌
				</Text>
			</View>
			<TouchableOpacity
				onPress={() => router.push("/(app)/home/profile")}
			>
				<View className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center">
					<Text className="text-sm font-bold text-white">
						{getInitials(currentPerson?.full_legal_name ?? "")}
					</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
};

export default Greeting;
