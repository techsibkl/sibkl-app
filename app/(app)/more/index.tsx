import { useExploreDestinations } from "@/config/exploreDestinations";
import SharedBody from "@/components/shared/SharedBody";
import { useRouter } from "expo-router";
import { ChevronRightIcon } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function MoreScreen() {
	const router = useRouter();
	const destinations = useExploreDestinations();

	return (
		<SharedBody>
			<ScrollView
				contentContainerStyle={{ paddingBottom: 32 }}
				className="flex-1"
			>
				<View className="mx-4 mt-2 bg-white rounded-2xl border border-border overflow-hidden">
					{destinations.map((item, index) => {
						const { Icon } = item;
						const isLast = index === destinations.length - 1;
						return (
							<Pressable
								key={item.id}
								onPress={() => router.push(item.href)}
								className={`flex-row items-center px-4 py-4 gap-3 active:opacity-80 ${
									isLast ? "" : "border-b border-border"
								}`}
							>
								<View
									className="w-10 h-10 rounded-xl items-center justify-center"
									style={{
										backgroundColor: item.iconWellColor,
									}}
								>
									<Icon
										size={20}
										color={item.iconColor}
										strokeWidth={1}
									/>
								</View>
								<View className="flex-1">
									<Text className="text-base font-semibold text-black">
										{item.title}
									</Text>
									<Text className="text-sm text-gray-500 mt-0.5">
										{item.subtitle}
									</Text>
								</View>
								<ChevronRightIcon size={18} color="#8E8E93" />
							</Pressable>
						);
					})}
				</View>
			</ScrollView>
		</SharedBody>
	);
}
