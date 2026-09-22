import { router } from "expo-router";
import { LockKeyhole } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CARD_W, FeatureItem, SCREEN_W } from "./featureData";

export type FeatureCardProps = Omit<FeatureItem, "key">;

// ─── Unlocked feature card ────────────────────────────────────────────────────

export const FeatureCard = ({
	Icon,
	title,
	description,
	color,
	bgColor,
	route,
}: FeatureCardProps) => (
	<View
		style={{ width: CARD_W, backgroundColor: bgColor }}
		className="rounded-2xl p-4"
	>
		<View className="flex-row items-start justify-between mb-2.5">
			<View
				className="w-12 h-12 rounded-xl items-center justify-center mb-3"
				style={{ backgroundColor: color + "22" }}
			>
				<Icon size={24} color={color} strokeWidth={1.5} />
			</View>
			<TouchableOpacity
				activeOpacity={0.85}
				onPress={() => {
					if (route) {
						router.push(route as any);
					}
				}}
			>
				<Text className="text-xs text-blue-400 font-bold leading-4 p-2 ">
					{"Explore"}
				</Text>
			</TouchableOpacity>
		</View>
		<Text className="text-base font-bold text-text mb-0.5">{title}</Text>
		<Text className="text-sm text-gray-500 font-regular leading-4">
			{description}
		</Text>
	</View>
);

// ─── Locked sneak-peek card ───────────────────────────────────────────────────

export const LockedFeatureCard = ({
	Icon,
	title,
	description,
	color,
	bgColor,
}: FeatureCardProps) => (
	<View
		style={{ width: Math.round(SCREEN_W * 0.52), backgroundColor: bgColor }}
		className="rounded-2xl p-4"
	>
		<View className="flex-row items-start justify-between mb-2.5">
			<View
				className="w-9 h-9 rounded-xl items-center justify-center"
				style={{ backgroundColor: color + "33" }}
			>
				<Icon size={18} color={color} strokeWidth={1.5} />
			</View>
			<View className="flex-row items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-gray-100">
				<LockKeyhole size={9} color="#9CA3AF" strokeWidth={2.5} />
				<Text
					className="text-gray-400 font-semibold"
					style={{ fontSize: 10 }}
				>
					Soon
				</Text>
			</View>
		</View>
		<Text className="text-base font-bold text-text mb-0.5">{title}</Text>
		<Text className="text-sm text-gray-500 font-regular leading-4">
			{description}
		</Text>
	</View>
);
