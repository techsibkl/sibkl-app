import { QrCodeIcon } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FeatureCard } from "./FeatureCards";
import { UNLOCK_FEATURES } from "./featureData";

type Props = {
	onCheckIn: () => void;
	onBack: () => void;
};

export const UnlockedView = ({ onCheckIn, onBack }: Props) => (
	<View>
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			className="h-[160px]"
			contentContainerStyle={{
				paddingHorizontal: 24,
				gap: 10,
				height: 160,
				alignItems: "center",
			}}
		>
			{UNLOCK_FEATURES.map(({ key, ...cardProps }) => (
				<FeatureCard key={key} {...cardProps} />
			))}
		</ScrollView>

		<View className="flex-row items-center gap-3 px-6 my-6">
			<View className="h-px flex-1 bg-gray-100" />
			<Text className="text-xs font-bold text-gray-400 tracking-widest uppercase">
				NEXT SESSION
			</Text>
			<View className="h-px flex-1 bg-gray-100" />
		</View>

		<View className="px-6">
			<TouchableOpacity
				onPress={onCheckIn}
				activeOpacity={0.82}
				className="py-4 rounded-2xl bg-primary-500 flex-row items-center justify-center gap-2 mb-3"
			>
				<QrCodeIcon size={18} color="white" strokeWidth={2} />
				<Text className="text-white font-bold text-base">
					Check in for Leader's Advance
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				onPress={onBack}
				activeOpacity={0.7}
				className="py-3 items-center"
			>
				<Text className="text-blue-400 text-sm underline">
					Back to home page
				</Text>
			</TouchableOpacity>
		</View>
	</View>
);
