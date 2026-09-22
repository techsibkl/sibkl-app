import { useSystemStore } from "@/stores/systemStore";
import { useRouter } from "expo-router";
import {
	Calendar,
	ChevronRight,
	ClipboardList,
	FunnelIcon,
	GraduationCap,
	LockKeyhole,
	LockKeyholeOpen,
	RefreshCw,
	Sparkles,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
	Dimensions,
	FlatList,
	ScrollView,
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

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useMsLeft(launchDate: string | null): number {
	const [msLeft, setMsLeft] = useState<number>(() => {
		if (!launchDate) return 0;
		return Math.max(0, new Date(launchDate).getTime() - Date.now());
	});

	useEffect(() => {
		if (!launchDate) {
			setMsLeft(0);
			return;
		}
		const tick = () =>
			setMsLeft(Math.max(0, new Date(launchDate).getTime() - Date.now()));
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [launchDate]);

	return msLeft;
}

// ─── Countdown display ────────────────────────────────────────────────────────

const CountdownDisplay = ({ msLeft }: { msLeft: number }) => {
	const d = Math.floor(msLeft / (1000 * 60 * 60 * 24));
	const h = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
	const m = Math.floor((msLeft / (1000 * 60)) % 60);
	const s = Math.floor((msLeft / 1000) % 60);
	const pad = (n: number) => String(n).padStart(2, "0");

	return (
		<View className="flex-row justify-center gap-3 mb-5">
			{[
				{ value: pad(d), label: "Days" },
				{ value: pad(h), label: "Hrs" },
				{ value: pad(m), label: "Min" },
				{ value: pad(s), label: "Sec" },
			].map(({ value, label }) => (
				<View key={label} className="items-center">
					<View className="w-[68px] h-16 bg-amber-50 rounded-2xl border border-amber-100 items-center justify-center">
						<Text className="text-2xl font-bold text-amber-800">
							{value}
						</Text>
					</View>
					<Text className="text-xs text-gray-400 mt-1.5 font-regular">
						{label}
					</Text>
				</View>
			))}
		</View>
	);
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ScreenState = "locked" | "refreshing" | "animating" | "unlocked";

// ─── Feature data ─────────────────────────────────────────────────────────────

const UNLOCK_FEATURES: {
	key: string;
	Icon: React.FC<any>;
	title: string;
	description: string;
	color: string;
	bgColor: string;
}[] = [
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

// ─── Feature card — unlocked ──────────────────────────────────────────────────

type FeatureCardProps = Omit<(typeof UNLOCK_FEATURES)[number], "key">;

const FeatureCard = ({
	Icon,
	title,
	description,
	color,
	bgColor,
}: FeatureCardProps) => (
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

// ─── Feature card — locked sneak peek ─────────────────────────────────────────

const LockedFeatureCard = ({
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
		<Text className="text-sm font-bold text-text mb-0.5">{title}</Text>
		<Text className="text-xs text-gray-400 font-regular leading-4">
			{description}
		</Text>
	</View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LaunchScreen() {
	const router = useRouter();
	const {
		appStatus,
		fetchSystemConfig,
		acknowledgeLaunch,
		activateLaunch,
		hasActivatedLaunch,
	} = useSystemStore();

	// BE has already set status = "unlocked" in the database.
	const beAlreadyUnlocked = appStatus?.status === "unlocked";

	// Countdown only blocks the button while the BE is still locked.
	// If the BE has already unlocked, button is active immediately — status
	// is the priority override over the countdown timer.
	const msLeft = useMsLeft(
		!beAlreadyUnlocked ? (appStatus?.launch_date ?? null) : null,
	);
	const isCountdownActive = msLeft > 0; // always false when beAlreadyUnlocked
	const countdownJustExpired =
		!beAlreadyUnlocked && !isCountdownActive && !!appStatus?.launch_date;

	// Start in the unlocked UI only if the user has already tapped
	// "Refresh to Unlock" and seen the animation this session
	// (hasActivatedLaunch is in-memory, resets on cold start).
	// The banner remains visible until they explicitly dismiss it.
	const startUnlocked = beAlreadyUnlocked && hasActivatedLaunch;

	const [screenState, setScreenState] = useState<ScreenState>(
		startUnlocked ? "unlocked" : "locked",
	);
	const [showOpenIcon, setShowOpenIcon] = useState(startUnlocked);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	// ─── Animated values ──────────────────────────────────────────────────────

	const lockScale = useSharedValue(1);
	const lockRotate = useSharedValue(0);
	const lockBg = useSharedValue(startUnlocked ? 1 : 0);

	const lockedOpacity = useSharedValue(startUnlocked ? 0 : 1);
	const unlockedOpacity = useSharedValue(startUnlocked ? 1 : 0);
	const unlockedY = useSharedValue(startUnlocked ? 0 : 36);

	// ─── Animated styles ──────────────────────────────────────────────────────

	const lockAnimStyle = useAnimatedStyle(() => ({
		transform: [
			{ scale: lockScale.value },
			{ rotate: `${lockRotate.value}deg` },
		],
		backgroundColor: interpolateColor(
			lockBg.value,
			[0, 1],
			["#F3F4F6", "#DCFCE7"],
		),
	}));

	const lockedStyle = useAnimatedStyle(() => ({
		opacity: lockedOpacity.value,
	}));

	const unlockedStyle = useAnimatedStyle(() => ({
		opacity: unlockedOpacity.value,
		transform: [{ translateY: unlockedY.value }],
	}));

	// ─── Unlock animation sequence ────────────────────────────────────────────

	const playUnlockAnimation = useCallback(() => {
		lockScale.value = withSequence(
			withTiming(1.35, { duration: 170 }),
			withSpring(1, { damping: 5, stiffness: 260 }),
		);
		lockRotate.value = withSequence(
			withTiming(-20, { duration: 120 }),
			withTiming(14, { duration: 120 }),
			withSpring(0, { damping: 8, stiffness: 180 }),
		);
		setTimeout(() => setShowOpenIcon(true), 260);
		lockBg.value = withDelay(260, withTiming(1, { duration: 350 }));
		lockedOpacity.value = withDelay(320, withTiming(0, { duration: 260 }));
		unlockedOpacity.value = withDelay(
			650,
			withTiming(1, { duration: 400 }),
		);
		unlockedY.value = withDelay(
			650,
			withSpring(0, { damping: 14, stiffness: 110 }),
		);
		setTimeout(() => setScreenState("unlocked"), 1300);
	}, [
		lockScale,
		lockRotate,
		lockBg,
		lockedOpacity,
		unlockedOpacity,
		unlockedY,
	]);

	// ─── Handlers ─────────────────────────────────────────────────────────────

	const handleRefresh = async () => {
		setErrorMsg(null);
		setScreenState("refreshing");
		await fetchSystemConfig();
		const newStatus = useSystemStore.getState().appStatus?.status;
		if (newStatus === "unlocked") {
			// Mark session as activated (in-memory only).
			// Banner stays visible; page restores unlocked state on re-entry.
			activateLaunch();
			setScreenState("animating");
			playUnlockAnimation();
		} else {
			setScreenState("locked");
			setErrorMsg("Almost there — check back when the launch kicks off!");
		}
	};

	const handleDone = async () => {
		await acknowledgeLaunch();
		router.back();
	};

	const isLockedView =
		screenState === "locked" || screenState === "refreshing";
	const isUnlockedView =
		screenState === "unlocked" || screenState === "animating";
	const refreshDisabled = screenState === "refreshing" || isCountdownActive;

	// ─── Render ───────────────────────────────────────────────────────────────

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ paddingBottom: 32, flex: 1 }}
		>
			{/* ────────────────────────────────────────────────────────────────
			    Lock icon — always visible, always animates
			──────────────────────────────────────────────────────────────── */}
			<View className="items-center pt-6">
				<Animated.View
					style={lockAnimStyle}
					className="w-24 h-24 rounded-full items-center justify-center mb-5"
				>
					{showOpenIcon ? (
						<LockKeyholeOpen
							size={44}
							color="#16A34A"
							strokeWidth={1.5}
						/>
					) : (
						<LockKeyhole
							size={44}
							color="#F59E0B"
							strokeWidth={1.5}
						/>
					)}
				</Animated.View>
			</View>

			{/* ────────────────────────────────────────────────────────────────
			    Hero text area — both headers always rendered so opacity
			    animations fire correctly; absolute-positioned inside a
			    fixed-height container so they don't stack.
			──────────────────────────────────────────────────────────────── */}
			<View className="items-center pb-6">
				{/* Locked header */}
				{isLockedView && (
					<Animated.View
						style={lockedStyle}
						className="items-center justify-start pt-1 px-6"
					>
						<View className="px-3 py-1 bg-amber-100 rounded-full mb-3">
							<Text className="text-amber-700 text-xs font-bold tracking-widest">
								LEADER'S ADVANCE 2026
							</Text>
						</View>
						<Text className="text-3xl font-bold text-text text-center leading-tight mb-2">
							Unlock the Full{"\n"}Experience
						</Text>
						<Text className="text-gray-500 font-regular text-center text-sm leading-5">
							Some features are reserved for the launch.{"\n"}Come
							to the event to unlock the complete app.
						</Text>
					</Animated.View>
				)}
				{isUnlockedView && (
					<Animated.View
						style={unlockedStyle}
						className="items-center justify-center px-6"
					>
						<Text className="text-3xl font-bold text-text text-center leading-tight mb-2">
							You're fully{"\n"}unlocked! 🎉
						</Text>
						<Text className="text-gray-500 font-regular text-center text-sm leading-5">
							Welcome to the complete SIBKL experience.
						</Text>
					</Animated.View>
				)}
			</View>
			{/* ────────────────────────────────────────────────────────────────
			    Locked: countdown · refresh button · sneak-peek carousel
			──────────────────────────────────────────────────────────────── */}
			{isLockedView && (
				<Animated.View style={lockedStyle} className="flex-1">
					<View>
						{/* Error banner */}
						{errorMsg && (
							<View className="mx-6 mb-4 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-100">
								<Text className="text-amber-700 text-sm text-center font-regular">
									{errorMsg}
								</Text>
							</View>
						)}

						{/* Countdown boxes */}
						{isCountdownActive && (
							<CountdownDisplay msLeft={msLeft} />
						)}

						{/* Post-countdown hint */}
						{countdownJustExpired && !errorMsg && (
							<Text className="text-center text-green-600 text-sm font-semibold mb-5">
								🎉 The time has come — tap below to unlock!
							</Text>
						)}

						{/* Refresh button */}
						<View className="px-6">
							<TouchableOpacity
								onPress={handleRefresh}
								disabled={refreshDisabled}
								activeOpacity={refreshDisabled ? 1 : 0.8}
								className={`py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
									refreshDisabled
										? "bg-gray-100"
										: "bg-gray-900"
								}`}
							>
								{screenState === "refreshing" ? (
									<>
										<RefreshCw
											size={18}
											color="#9CA3AF"
											strokeWidth={1.5}
										/>
										<Text className="text-gray-400 font-semibold text-base ml-2">
											Checking…
										</Text>
									</>
								) : (
									<>
										<Sparkles
											size={18}
											color={
												refreshDisabled
													? "#D1D5DB"
													: "#FCD34D"
											}
											strokeWidth={1.5}
										/>
										<Text
											className={`font-semibold text-base ml-2 ${
												refreshDisabled
													? "text-gray-400"
													: "text-white"
											}`}
										>
											Refresh to Unlock
										</Text>
									</>
								)}
							</TouchableOpacity>

							<Text className="text-center text-xs text-gray-400 mt-3  font-regular">
								{isCountdownActive
									? "The unlock button will activate when the event begins."
									: "Already at the event? Tap above when the launch begins."}
							</Text>
						</View>

						{/* ── Sneak-peek section ── */}
						<View className="flex-row items-center gap-3 px-6 my-6">
							<View className="h-px flex-1 bg-gray-100" />
							<Text className="text-xs font-bold text-gray-400 tracking-widest uppercase">
								Coming at launch
							</Text>
							<View className="h-px flex-1 bg-gray-100" />
						</View>

						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{
								paddingHorizontal: 24,
								gap: 10,
							}}
						>
							{UNLOCK_FEATURES.map(({ key, ...cardProps }) => (
								<LockedFeatureCard key={key} {...cardProps} />
							))}
						</ScrollView>
					</View>
				</Animated.View>
			)}

			{/* ────────────────────────────────────────────────────────────────
			    Unlocked: feature carousel + CTAs
			──────────────────────────────────────────────────────────────── */}
			{isUnlockedView && (
				<Animated.View style={unlockedStyle} className="flex-1">
					<FlatList
						data={UNLOCK_FEATURES}
						horizontal
						keyExtractor={(item) => item.key}
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ paddingHorizontal: 24 }}
						ItemSeparatorComponent={() => (
							<View style={{ width: 12 }} />
						)}
						snapToInterval={CARD_W + 12}
						snapToAlignment="start"
						decelerationRate="fast"
						renderItem={({ item: { key, ...cardProps } }) => (
							<FeatureCard {...cardProps} />
						)}
						className="flex-grow-0 mb-6"
					/>

					<View className="px-6">
						<TouchableOpacity
							onPress={handleDone}
							activeOpacity={0.82}
							className="py-4 rounded-2xl bg-primary-500 flex-row items-center justify-center gap-2 mb-3"
						>
							<Text className="text-white font-bold text-base">
								Check in for Leader's Advance
							</Text>
							<ChevronRight
								size={18}
								color="white"
								strokeWidth={2}
							/>
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
					</View>
				</Animated.View>
			)}
		</ScrollView>
	);
}
