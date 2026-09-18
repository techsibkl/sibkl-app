import { useSystemStore } from "@/stores/systemStore";
import { FeatureFlags } from "@/types/SystemConfig";
import { useRouter } from "expo-router";
import { ChevronRight, LockKeyholeOpen, LockKeyhole } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const isAnyFeatureEnabled = (flags: FeatureFlags) =>
	flags.cells || flags.events || flags.leadersPage || flags.cellAttendance;

/**
 * Shown on the home page while hasNewLaunch is true.
 * Disappears after acknowledgeLaunch() is called from the launch screen.
 */
const LaunchBanner = () => {
	const router = useRouter();
	const { hasNewLaunch, featureFlags } = useSystemStore();

	if (!hasNewLaunch) return null;

	const isUnlocked = isAnyFeatureEnabled(featureFlags);

	return (
		<TouchableOpacity
			onPress={() => router.push("/(app)/home/launch" as any)}
			activeOpacity={0.82}
			className="mx-4 mb-5 rounded-2xl overflow-hidden bg-gray-900"
		>
			<View className="flex-row items-center px-4 py-4 gap-3">
				{/* Icon */}
				<View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center shrink-0">
					{isUnlocked ? (
						<LockKeyholeOpen size={20} color="#4ADE80" strokeWidth={1.5} />
					) : (
						<LockKeyhole size={20} color="#FCD34D" strokeWidth={1.5} />
					)}
				</View>

				{/* Text */}
				<View className="flex-1">
					<Text className="text-white font-semibold text-sm leading-5">
						{isUnlocked
							? "You're unlocked! 🎉 See what's new →"
							: "Unlock the Full Experience"}
					</Text>
					{!isUnlocked && (
						<Text className="text-white/55 text-xs mt-0.5 font-regular">
							Come to Leader's Advance 2026 to experience the launch
						</Text>
					)}
				</View>

				{/* Arrow */}
				<ChevronRight size={16} color="rgba(255,255,255,0.35)" strokeWidth={2} />
			</View>
		</TouchableOpacity>
	);
};

export default LaunchBanner;
