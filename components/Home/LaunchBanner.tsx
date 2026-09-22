import { useSystemStore } from "@/stores/systemStore";
import { useRouter } from "expo-router";
import {
	ChevronRight,
	LockKeyhole,
	LockKeyholeOpen,
} from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

// ─── Banner ───────────────────────────────────────────────────────────────────

/**
 * Shown on the home page while hasNewLaunch is true.
 * Locked/unlocked state is driven by appStatus.status (BE-controlled),
 * not by which feature flags happen to be enabled.
 * Disappears after acknowledgeLaunch() is called from the launch screen.
 */
const LaunchBanner = () => {
	const router = useRouter();
	const { hasNewLaunch, hasActivatedLaunch } = useSystemStore();

	if (!hasNewLaunch) return null;

	// isUnlocked = true only when the user has completed the unlock animation
	// for the current launch_version (persisted to disk). A new launch_version
	// resets hasActivatedLaunch to false regardless of the BE status field.
	const isUnlocked = hasActivatedLaunch;

	return (
		<TouchableOpacity
			onPress={() => router.push("/(app)/home/launch" as any)}
			activeOpacity={0.78}
			className={`mx-4 mb-5 rounded-2xl overflow-hidden border ${
				isUnlocked
					? "bg-green-50 border-green-100"
					: "bg-amber-50 border-amber-100"
			}`}
		>
			<View className="flex-row items-center px-4 py-3.5 gap-3">
				{/* Icon bubble */}
				<View
					className="w-10 h-10 rounded-full items-center justify-center shrink-0"
					style={{
						backgroundColor: isUnlocked ? "#DCFCE7" : "#FDE68A",
					}}
				>
					{isUnlocked ? (
						<LockKeyholeOpen
							size={19}
							color="#16A34A"
							strokeWidth={1.75}
						/>
					) : (
						<LockKeyhole
							size={19}
							color="#D97706"
							strokeWidth={1.75}
						/>
					)}
				</View>

				{/* Text block */}
				<View className="flex-1">
					<Text
						className={`font-semibold text-sm leading-5 ${
							isUnlocked ? "text-green-900" : "text-amber-900"
						}`}
					>
						{isUnlocked
							? "All features available! 🎉"
							: "Limited features"}
					</Text>
					<Text
						className={`text-xs mt-0.5 font-regular leading-4 ${
							isUnlocked ? "text-green-700" : "text-amber-700"
						}`}
					>
						{isUnlocked
							? "Tap to explore everything that's now available"
							: "Unlock the full experience at Leader's Advance"}
					</Text>
				</View>

				{/* Arrow */}
				<ChevronRight
					size={16}
					color={isUnlocked ? "#15803D" : "#B45309"}
					strokeWidth={2}
				/>
			</View>
		</TouchableOpacity>
	);
};

export default LaunchBanner;
