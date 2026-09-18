import { useSystemStore } from "@/stores/systemStore";
import { FeatureFlags } from "@/types/SystemConfig";
import { useRouter } from "expo-router";
import {
	Calendar,
	ChevronRight,
	Circle as CircleIcon,
	ClipboardList,
	FunnelIcon,
	GraduationCap,
	LockKeyhole,
	LockKeyholeOpen,
	RefreshCw,
	Sparkles,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
	Dimensions,
	FlatList,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";

// ─── Types & helpers ─────────────────────────────────────────────────────────

type ScreenState = "locked" | "refreshing" | "animating" | "unlocked";

const isAnyFeatureEnabled = (flags: FeatureFlags) =>
	flags.cells || flags.events || flags.leadersPage || flags.cellAttendance;

// ─── Feature card data ───────────────────────────────────────────────────────

const UNLOCK_FEATURES: {
	key: keyof FeatureFlags;
	Icon: React.FC<any>;
	title: string;
	description: string;
	color: string;
	bgColor: string;
}[] = [
	{
		key: "cells",
		Icon: CircleIcon,
		title: "Cell Groups",
		description: "Join and stay connected with your cell group.",
		color: "#3B82F6",
		bgColor: "#EFF6FF",
	},
	{
		key: "cellAttendance",
		Icon: ClipboardList,
		title: "Cell Attendance",
		description: "Track who attends your cell group sessions.",
		color: "#10B981",
		bgColor: "#ECFDF5",
	},
	{
		key: "cellFollowUp",
		Icon: FunnelIcon,
		title: "Guest Follow-up",
		description: "Manage guests and track their journey.",
		color: "#8B5CF6",
		bgColor: "#F5F3FF",
	},
	{
		key: "leadersPage",
		Icon: GraduationCap,
		title: "Leader's Directory",
		description: "Browse and connect with church leaders.",
		color: "#F59E0B",
		bgColor: "#FFFBEB",
	},
	{
		key: "events",
		Icon: Calendar,
		title: "Events",
		description: "Stay updated on upcoming church events.",
		color: "#EF4444",
		bgColor: "#FEF2F2",
	},
];

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = Math.round(SCREEN_W * 0.62);

// ─── Feature card ─────────────────────────────────────────────────────────────

type FeatureCardProps = (typeof UNLOCK_FEATURES)[number];

const FeatureCard = ({ Icon, title, description, color, bgColor }: FeatureCardProps) => (
	<View
		style={{ width: CARD_W, backgroundColor: bgColor }}
		className="rounded-2xl p-5"
	>
		<View
			className="w-12 h-12 rounded-xl items-center justify-center mb-3"
			style={{ backgroundColor: color + "22" }}
		>
			<Icon size={24} color={color} strokeWidth={1.5} />
		</View>
		<Text className="text-base font-bold text-text mb-1">{title}</Text>
		<Text className="text-sm text-gray-500 font-regular leading-5">
			{description}
		</Text>
	</View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LaunchScreen() {
	const router = useRouter();
	const { featureFlags, fetchSystemConfig, acknowledgeLaunch } = useSystemStore();

	const alreadyUnlocked = isAnyFeatureEnabled(featureFlags);

	const [screenState, setScreenState] = useState<ScreenState>(
		alreadyUnlocked ? "unlocked" : "locked",
	);
	const [showOpenIcon, setShowOpenIcon] = useState(alreadyUnlocked);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	// ─── Animated values ─────────────────────────────────────────────────────

	const lockScale = useSharedValue(1);
	const lockRotate = useSharedValue(0);
	const lockBg = useSharedValue(alreadyUnlocked ? 1 : 0); // 0=gray 1=green

	const lockedOpacity = useSharedValue(alreadyUnlocked ? 0 : 1);
	const unlockedOpacity = useSharedValue(alreadyUnlocked ? 1 : 0);
	const unlockedY = useSharedValue(alreadyUnlocked ? 0 : 36);

	// ─── Animated styles ─────────────────────────────────────────────────────

	const lockAnimStyle = useAnimatedStyle(() => ({
		transform: [
			{ scale: lockScale.value },
			{ rotate: `${lockRotate.value}deg` },
		],
		backgroundColor: interpolateColor(lockBg.value, [0, 1], ["#F3F4F6", "#DCFCE7"]),
	}));

	const lockedStyle = useAnimatedStyle(() => ({
		opacity: lockedOpacity.value,
	}));

	const unlockedStyle = useAnimatedStyle(() => ({
		opacity: unlockedOpacity.value,
		transform: [{ translateY: unlockedY.value }],
	}));

	// ─── Unlock animation sequence ───────────────────────────────────────────

	const playUnlockAnimation = useCallback(() => {
		// 1. Lock icon bounces
		lockScale.value = withSequence(
			withTiming(1.35, { duration: 170 }),
			withSpring(1, { damping: 5, stiffness: 260 }),
		);
		lockRotate.value = withSequence(
			withTiming(-20, { duration: 120 }),
			withTiming(14, { duration: 120 }),
			withSpring(0, { damping: 8, stiffness: 180 }),
		);

		// 2. Swap lock → open-lock icon at peak of bounce
		setTimeout(() => setShowOpenIcon(true), 260);

		// 3. Background circle turns green
		lockBg.value = withDelay(260, withTiming(1, { duration: 350 }));

		// 4. Locked text fades out
		lockedOpacity.value = withDelay(320, withTiming(0, { duration: 260 }));

		// 5. Unlocked section slides up and fades in
		unlockedOpacity.value = withDelay(650, withTiming(1, { duration: 400 }));
		unlockedY.value = withDelay(
			650,
			withSpring(0, { damping: 14, stiffness: 110 }),
		);

		// 6. Transition state to 'unlocked' after animation finishes
		setTimeout(() => setScreenState("unlocked"), 1300);
	}, [lockScale, lockRotate, lockBg, lockedOpacity, unlockedOpacity, unlockedY]);

	// ─── Handlers ─────────────────────────────────────────────────────────────

	const handleRefresh = async () => {
		setErrorMsg(null);
		setScreenState("refreshing");
		await fetchSystemConfig();
		const newFlags = useSystemStore.getState().featureFlags;
		if (isAnyFeatureEnabled(newFlags)) {
			setScreenState("animating");
			playUnlockAnimation();
		} else {
			setScreenState("locked");
			setErrorMsg("Not yet — check back when the event kicks off! 👀");
		}
	};

	const handleDone = async () => {
		await acknowledgeLaunch();
		router.back();
	};

	const isLockedView = screenState === "locked" || screenState === "refreshing";
	const isUnlockedView = screenState === "unlocked" || screenState === "animating";

	// ─── Render ───────────────────────────────────────────────────────────────

	return (
		<View className="flex-1 bg-white px-6">
			{/* ── Hero lock icon ── */}
			<View className="items-center pt-10 pb-8">
				<Animated.View
					style={lockAnimStyle}
					className="w-24 h-24 rounded-full items-center justify-center mb-5"
				>
					{showOpenIcon ? (
						<LockKeyholeOpen size={44} color="#16A34A" strokeWidth={1.5} />
					) : (
						<LockKeyhole size={44} color="#F59E0B" strokeWidth={1.5} />
					)}
				</Animated.View>

				{/* ── Locked header ── */}
				<Animated.View style={lockedStyle} className="items-center absolute top-28">
					<View className="px-3 py-1 bg-amber-100 rounded-full mb-3">
						<Text className="text-amber-700 text-xs font-semibold tracking-wide">
							LEADER'S ADVANCE 2026
						</Text>
					</View>
					<Text className="text-2xl font-bold text-text text-center leading-tight">
						Unlock the Full{"\n"}Experience
					</Text>
					<Text className="text-gray-500 font-regular text-center mt-3 leading-6">
						Some features are reserved for the launch.{"\n"}
						Come to the event to unlock the complete SIBKL app.
					</Text>
					{errorMsg && (
						<View className="mt-4 px-4 py-3 bg-amber-50 rounded-2xl">
							<Text className="text-amber-700 text-sm text-center font-regular">
								{errorMsg}
							</Text>
						</View>
					)}
				</Animated.View>

				{/* ── Unlocked header ── */}
				<Animated.View
					style={unlockedStyle}
					className="items-center absolute top-28"
				>
					<Text className="text-2xl font-bold text-text text-center leading-tight">
						You're fully unlocked! 🎉
					</Text>
					<Text className="text-gray-500 font-regular text-center mt-2 leading-6">
						Welcome to the complete SIBKL experience.
					</Text>
				</Animated.View>
			</View>

			{/* ── Spacer to push content below the absolute hero text ── */}
			<View style={{ height: 130 }} />

			{/* ── Locked: refresh button ── */}
			{isLockedView && (
				<Animated.View style={lockedStyle}>
					<TouchableOpacity
						onPress={handleRefresh}
						disabled={screenState === "refreshing"}
						activeOpacity={0.8}
						className="py-4 rounded-2xl bg-gray-900 flex-row items-center justify-center gap-2"
					>
						{screenState === "refreshing" ? (
							<>
								<RefreshCw size={18} color="white" strokeWidth={1.5} />
								<Text className="text-white font-semibold text-base ml-2">
									Checking…
								</Text>
							</>
						) : (
							<>
								<Sparkles size={18} color="#FCD34D" strokeWidth={1.5} />
								<Text className="text-white font-semibold text-base ml-2">
									Refresh to Unlock
								</Text>
							</>
						)}
					</TouchableOpacity>
					<Text className="text-center text-xs text-gray-400 mt-3 font-regular">
						Already at the event? Tap above when the launch begins.
					</Text>
				</Animated.View>
			)}

			{/* ── Unlocked: feature cards + CTA ── */}
			{isUnlockedView && (
				<Animated.View style={unlockedStyle} className="flex-1">
					{/* Feature carousel */}
					<FlatList
						data={UNLOCK_FEATURES}
						horizontal
						keyExtractor={(item) => item.key}
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ paddingHorizontal: 0 }}
						ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
						snapToInterval={CARD_W + 12}
						snapToAlignment="start"
						decelerationRate="fast"
						renderItem={({ item }) => <FeatureCard {...item} />}
						className="mb-6"
					/>

					{/* Check-in CTA */}
					<TouchableOpacity
						onPress={handleDone}
						activeOpacity={0.82}
						className="py-4 rounded-2xl bg-primary-500 flex-row items-center justify-center gap-2 mb-3"
					>
						<Text className="text-white font-bold text-base">
							Check in for Leader's Advance
						</Text>
						<ChevronRight size={18} color="white" strokeWidth={2} />
					</TouchableOpacity>

					<TouchableOpacity
						onPress={handleDone}
						activeOpacity={0.7}
						className="py-3 items-center"
					>
						<Text className="text-gray-400 text-sm font-regular">
							Maybe later
						</Text>
					</TouchableOpacity>
				</Animated.View>
			)}
		</View>
	);
}
