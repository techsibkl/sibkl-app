import { CelebrationScreen } from "@/components/Launch/CelebrationScreen";
import { useMsLeft } from "@/components/Launch/CountdownDisplay";
import { LockedView } from "@/components/Launch/LockedView";
import { UnlockedView } from "@/components/Launch/UnlockedView";
import SharedHeader from "@/components/shared/SharedHeader";
import { useSystemStore } from "@/stores/systemStore";
import { useRouter } from "expo-router";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";

// ─── Types ────────────────────────────────────────────────────────────────────

type ScreenState = "locked" | "refreshing" | "celebrating" | "unlocked";

/** Height reserved for the absolute-positioned hero text blocks. */
const HEADER_AREA_H = 185;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LaunchScreen() {
	const router = useRouter();
	const { appStatus, fetchSystemConfig, activateLaunch, hasActivatedLaunch } =
		useSystemStore();

	// ─── Derived state ────────────────────────────────────────────────────────

	const beAlreadyUnlocked = appStatus?.status === "unlocked";

	// Countdown only blocks the button while the BE is still locked.
	// If the BE has already unlocked, `msLeft` is always 0 so the button is active.
	const msLeft = useMsLeft(
		!beAlreadyUnlocked ? (appStatus?.launch_date ?? null) : null,
	);
	const isCountdownActive = msLeft > 0;
	const countdownJustExpired =
		!beAlreadyUnlocked && !isCountdownActive && !!appStatus?.launch_date;

	// Start unlocked only if the user has already gone through the animation
	// this session (hasActivatedLaunch is in-memory, resets on cold start).
	const startUnlocked = beAlreadyUnlocked && hasActivatedLaunch;

	// ─── Local state ──────────────────────────────────────────────────────────

	const [screenState, setScreenState] = useState<ScreenState>(
		startUnlocked ? "unlocked" : "locked",
	);
	const [showOpenIcon, setShowOpenIcon] = useState(startUnlocked);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	// ─── Animated values ──────────────────────────────────────────────────────

	const lockBg = useSharedValue(startUnlocked ? 1 : 0);
	const lockedOpacity = useSharedValue(startUnlocked ? 0 : 1);
	const unlockedOpacity = useSharedValue(startUnlocked ? 1 : 0);
	const unlockedY = useSharedValue(startUnlocked ? 0 : 36);

	const lockAnimStyle = useAnimatedStyle(() => ({
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

	// ─── Handlers ─────────────────────────────────────────────────────────────

	const handleRefresh = async () => {
		setErrorMsg(null);
		setScreenState("refreshing");
		await fetchSystemConfig();
		const newStatus = useSystemStore.getState().appStatus?.status;
		if (newStatus === "unlocked") {
			await activateLaunch();
			// Pre-set the unlocked UI behind the celebration overlay so it's
			// immediately visible once the overlay fades out on "Explore".
			lockBg.value = 1;
			lockedOpacity.value = 0;
			unlockedOpacity.value = 1;
			unlockedY.value = 0;
			setShowOpenIcon(true);
			setScreenState("celebrating");
		} else {
			setScreenState("locked");
			setErrorMsg("Almost there — check back when the launch kicks off!");
		}
	};

	// Called by CelebrationScreen once its fade-out completes.
	const handleExplore = useCallback(() => setScreenState("unlocked"), []);

	// ─── View flags ───────────────────────────────────────────────────────────

	const isLockedView =
		screenState === "locked" || screenState === "refreshing";
	// Unlocked content renders during "celebrating" too (hidden under the overlay)
	// so it's ready the instant the overlay fades out.
	const isUnlockedView =
		screenState === "unlocked" || screenState === "celebrating";
	const refreshDisabled = screenState === "refreshing" || isCountdownActive;

	// ─── Render ───────────────────────────────────────────────────────────────

	return (
		<View className="flex-1">
			{/* Hides header during animation */}
			{!(screenState === "celebrating") && (
				<SharedHeader
					title="Leader's Advance 2026"
					isPop
					className="!bg-white"
				/>
			)}
			<ScrollView
				showsVerticalScrollIndicator={false}
				className="bg-white"
				contentContainerStyle={{
					paddingTop: 64,
					paddingBottom: 64,
					flexGrow: 1,
				}}
				refreshControl={
					true ? (
						<RefreshControl
							refreshing={screenState === "refreshing"}
							onRefresh={handleRefresh}
							tintColor="#F59E0B"
							colors={["#F59E0B"]}
						/>
					) : undefined
				}
			>
				{/* Lock icon — always visible */}
				<View className="w-full items-center">
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

				<View className="flex-col">
					{isLockedView && (
						<Animated.View
							style={lockedStyle}
							className="items-center justify-start pt-1 px-6 gap-2 mb-6"
						>
							<View className="px-3 py-1 bg-amber-100 rounded-full">
								<Text className="text-amber-700 text-xs font-bold tracking-widest">
									LEADER'S ADVANCE 2026
								</Text>
							</View>
							<Text className="text-3xl font-bold text-text text-center leading-tight">
								Unlock the Full{"\n"}Experience
							</Text>
							<Text className="text-gray-500 font-regular text-center text-sm leading-5">
								Some features are reserved for the launch.{"\n"}
								Come to the event to unlock the complete app.
							</Text>
						</Animated.View>
					)}
					{isUnlockedView && (
						<Animated.View
							style={unlockedStyle}
							className="items-center justify-start pt-1 px-6 mb-6"
						>
							<Text className="text-3xl font-bold text-text text-center leading-tight">
								All features available!
							</Text>
							<Text className="text-gray-500 font-regular text-center text-sm leading-5">
								Welcome to the complete SIBKL experience.
							</Text>
						</Animated.View>
					)}
				</View>

				{/* Locked: countdown · refresh button · sneak-peek carousel */}
				{isLockedView && (
					<Animated.View style={lockedStyle} className="">
						<LockedView
							screenState={screenState as "locked" | "refreshing"}
							isCountdownActive={isCountdownActive}
							msLeft={msLeft}
							countdownJustExpired={countdownJustExpired}
							beAlreadyUnlocked={beAlreadyUnlocked}
							errorMsg={errorMsg}
							refreshDisabled={refreshDisabled}
							onRefresh={handleRefresh}
						/>
					</Animated.View>
				)}

				{/* Unlocked: feature carousel + CTAs */}
				{isUnlockedView && (
					<Animated.View style={unlockedStyle}>
						<UnlockedView
							onCheckIn={() =>
								router.push("/(app)/events" as any)
							}
							onBack={() => router.back()}
						/>
					</Animated.View>
				)}
			</ScrollView>

			{/* Celebration overlay — on top of everything, full-screen */}
			{screenState === "celebrating" && (
				<CelebrationScreen onExplore={handleExplore} />
			)}
		</View>
	);
}
