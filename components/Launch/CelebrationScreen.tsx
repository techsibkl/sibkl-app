import { LockKeyhole, LockKeyholeOpen } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
	Dimensions,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import _ConfettiCannon from "react-native-confetti-cannon";
import Animated, {
	Easing,
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { SCREEN_W } from "./featureData";
// The published types are missing the `angle` prop — cast to any to silence TS.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ConfettiCannon = _ConfettiCannon as any;

// ─── Timing constants ─────────────────────────────────────────────────────────

const PROGRESS_DELAY_MS = 0;
const PROGRESS_DURATION_MS = 8000;
const COMPLETE_MS = PROGRESS_DELAY_MS + PROGRESS_DURATION_MS;
const CONFETTI_FIRE_MS = COMPLETE_MS + 80;
const EXPAND_DURATION_MS = 700;
/** NativeWind `w-28` — used as the expanding-circle origin size. */
const ICON_SIZE = 130;
const LIGHT_GREEN = "#DCFCE7";
const RED_500 = "#FEE2E2";
const GRAY_800 = "#1F2937";

const LOADING_MESSAGES = [
	"Preparing your experience...",
	"Downloading content...",
	"Unlocking features...",
	"Syncing your profile...",
	"Almost there...",
	"Finishing up...",
];
const DONE_MESSAGE = "Done!";
const MSG_INTERVAL_MS = Math.floor(
	PROGRESS_DURATION_MS / LOADING_MESSAGES.length,
);

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
	onExplore: () => void;
};

export const CelebrationScreen = ({ onExplore }: Props) => {
	const leftRef = useRef<any>(null);
	const rightRef = useRef<any>(null);
	const { width, height } = Dimensions.get("window");
	const expandScaleTo = (Math.hypot(width, height) / ICON_SIZE) * 1.2;

	// Icon
	const iconScale = useSharedValue(0);
	const iconBg = useSharedValue(0); // 0 = gray, 1 = green
	const [showUnlockIcon, setShowUnlockIcon] = useState(false);

	// Expanding circle fill
	const expandScale = useSharedValue(1);
	const expandOpacity = useSharedValue(0);

	// Progress
	const progress = useSharedValue(0);
	const [displayPercent, setDisplayPercent] = useState(0);

	// Rotating status message
	const [msgIndex, setMsgIndex] = useState(0);
	const [isComplete, setIsComplete] = useState(false);
	const msgOpacity = useSharedValue(0);

	// Overlay + Explore button + text tone (0 = white-on-primary, 1 = gray-800)
	const overlayOpacity = useSharedValue(0);
	const buttonOpacity = useSharedValue(0);
	const textTone = useSharedValue(0);
	const [fillOrigin, setFillOrigin] = useState({ x: 0, y: 0 });

	useEffect(() => {
		// 1. Overlay fades in
		overlayOpacity.value = withTiming(1, { duration: 380 });

		// 2. Lock icon bounces in
		iconScale.value = withDelay(
			300,
			withSpring(1, { damping: 10, stiffness: 180 }),
		);

		// 3. Soft pulse while locked
		const pulseTimer = setTimeout(() => {
			iconScale.value = withRepeat(
				withSequence(
					withTiming(1.1, {
						duration: 900,
						easing: Easing.inOut(Easing.ease),
					}),
					withTiming(1.0, {
						duration: 900,
						easing: Easing.inOut(Easing.ease),
					}),
				),
				-1,
				false,
			);
		}, 900);

		// 4. Progress bar fills over 8 s
		progress.value = withDelay(
			PROGRESS_DELAY_MS,
			withTiming(1, {
				duration: PROGRESS_DURATION_MS,
				easing: Easing.inOut(Easing.cubic),
			}),
		);

		// 5. Percentage counter (~12× per second)
		const percentInterval = setInterval(() => {
			setDisplayPercent(Math.round(progress.value * 100));
		}, 80);

		// 6. Fade in first message when bar starts
		const msgFadeIn = setTimeout(() => {
			msgOpacity.value = withTiming(1, { duration: 300 });
		}, PROGRESS_DELAY_MS);

		// 7. Rotate messages evenly across the 8 s window
		let msgSwapTimeout: ReturnType<typeof setTimeout> | undefined;
		const msgRotate = setInterval(() => {
			msgOpacity.value = withSequence(
				withTiming(0, { duration: 200 }),
				withTiming(1, { duration: 200 }),
			);
			msgSwapTimeout = setTimeout(() => {
				setMsgIndex((prev) =>
					Math.min(prev + 1, LOADING_MESSAGES.length - 1),
				);
			}, 220);
		}, MSG_INTERVAL_MS);

		// 8. Progress complete — unlock icon, circle expands to fill the screen
		const completeTimer = setTimeout(() => {
			clearInterval(msgRotate);
			if (msgSwapTimeout) clearTimeout(msgSwapTimeout);
			clearInterval(percentInterval);
			setDisplayPercent(100);
			setShowUnlockIcon(true);

			iconScale.value = withSequence(
				withTiming(1.35, { duration: 150 }),
				withSpring(1, { damping: 5, stiffness: 250 }),
			);
			iconBg.value = withTiming(1, { duration: 400 });
			expandOpacity.value = 1;
			expandScale.value = withTiming(expandScaleTo, {
				duration: EXPAND_DURATION_MS,
				easing: Easing.out(Easing.cubic),
			});
			textTone.value = withTiming(1, {
				duration: EXPAND_DURATION_MS,
				easing: Easing.out(Easing.cubic),
			});

			msgOpacity.value = withTiming(0, { duration: 120 });
			msgSwapTimeout = setTimeout(() => {
				setIsComplete(true);
				msgOpacity.value = withTiming(1, { duration: 220 });
			}, 130);
		}, COMPLETE_MS);

		// 9. Confetti burst + Explore button after bar fills
		const confettiTimer = setTimeout(() => {
			leftRef.current?.start();
			rightRef.current?.start();
			buttonOpacity.value = withSpring(1, {
				damping: 12,
				stiffness: 110,
			});
		}, CONFETTI_FIRE_MS);

		return () => {
			clearTimeout(pulseTimer);
			clearInterval(percentInterval);
			clearTimeout(msgFadeIn);
			clearInterval(msgRotate);
			if (msgSwapTimeout) clearTimeout(msgSwapTimeout);
			clearTimeout(completeTimer);
			clearTimeout(confettiTimer);
		};
	}, []);

	const overlayStyle = useAnimatedStyle(() => ({
		opacity: overlayOpacity.value,
	}));
	const expandCircleStyle = useAnimatedStyle(() => ({
		transform: [{ scale: expandScale.value }],
		opacity: expandOpacity.value,
	}));
	const iconBubbleStyle = useAnimatedStyle(() => ({
		transform: [{ scale: iconScale.value }],
		backgroundColor: interpolateColor(
			iconBg.value,
			[0, 1],
			[RED_500, LIGHT_GREEN],
		),
	}));
	const headlineStyle = useAnimatedStyle(() => ({
		color: interpolateColor(textTone.value, [0, 1], ["#FFFFFF", GRAY_800]),
	}));
	const subtitleStyle = useAnimatedStyle(() => ({
		color: interpolateColor(
			textTone.value,
			[0, 1],
			["rgba(255,255,255,0.7)", GRAY_800],
		),
	}));
	const msgStyle = useAnimatedStyle(() => ({
		opacity: msgOpacity.value,
		color: interpolateColor(
			textTone.value,
			[0, 1],
			["rgba(255,255,255,0.6)", GRAY_800],
		),
	}));
	const percentStyle = useAnimatedStyle(() => ({
		color: interpolateColor(textTone.value, [0, 1], ["#FFFFFF", GRAY_800]),
	}));
	const progressTrackStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(
			textTone.value,
			[0, 1],
			["rgba(255,255,255,0.25)", "rgba(31,41,55,0.15)"],
		),
	}));
	const progressBarStyle = useAnimatedStyle(() => ({
		width: `${progress.value * 100}%` as any,
		backgroundColor: interpolateColor(
			textTone.value,
			[0, 1],
			["#FFFFFF", GRAY_800],
		),
	}));
	const buttonStyle = useAnimatedStyle(() => ({
		opacity: buttonOpacity.value,
		transform: [{ translateY: (1 - buttonOpacity.value) * 18 }],
	}));

	const handlePress = () => {
		overlayOpacity.value = withTiming(0, { duration: 380 });
		setTimeout(() => onExplore(), 360);
	};

	return (
		<Animated.View
			style={[StyleSheet.absoluteFill, overlayStyle]}
			className="bg-primary-500"
		>
			{/* Circle fill — sibling behind content so the scale transform cannot cover text */}
			<Animated.View
				pointerEvents="none"
				style={[
					{
						position: "absolute",
						left: fillOrigin.x,
						top: fillOrigin.y,
						width: ICON_SIZE,
						height: ICON_SIZE,
						borderRadius: ICON_SIZE / 2,
						backgroundColor: LIGHT_GREEN,
						zIndex: 0,
					},
					expandCircleStyle,
				]}
			/>

			<View
				style={{ zIndex: 1 }}
				className="flex-1 items-center justify-center px-8"
			>
				{/* Lock → unlock icon bubble; onLayout pins the expanding circle to this origin */}
				<View
					className="mb-6 items-center justify-center"
					onLayout={(e) => {
						const { x, y } = e.nativeEvent.layout;
						setFillOrigin({ x, y });
					}}
				>
					<Animated.View
						style={iconBubbleStyle}
						className="w-28 h-28 rounded-full items-center justify-center"
					>
						{showUnlockIcon ? (
							<LockKeyholeOpen
								size={80}
								color="#16A34A"
								strokeWidth={1.5}
							/>
						) : (
							<LockKeyhole
								size={52}
								color={"#DC2626"}
								strokeWidth={1.5}
							/>
						)}
					</Animated.View>
				</View>

				{/* Headline — updates when icon swaps */}
				<Animated.Text
					style={headlineStyle}
					className="text-3xl font-bold text-center leading-tight"
				>
					{showUnlockIcon ? "You're Unlocked!" : "Unlocking..."}
				</Animated.Text>
				<Animated.Text
					style={subtitleStyle}
					className="text-base font-regular mt-2 text-center leading-6"
				>
					{showUnlockIcon
						? "Welcome to the full SIBKL experience!!"
						: "Almost there..."}
				</Animated.Text>

				{/* Rotating status message + live percentage */}
				<View
					className="flex-row items-center justify-between mt-10"
					style={{ width: SCREEN_W - 96 }}
				>
					<Animated.Text
						style={msgStyle}
						className="text-xs font-regular flex-1 mr-3"
						numberOfLines={1}
					>
						{isComplete ? DONE_MESSAGE : LOADING_MESSAGES[msgIndex]}
					</Animated.Text>
					<Animated.Text
						style={percentStyle}
						className="font-bold text-sm tabular-nums"
					>
						{displayPercent}%
					</Animated.Text>
				</View>

				{/* Progress bar */}
				<Animated.View
					style={[
						progressTrackStyle,
						{
							width: SCREEN_W - 96,
							height: 6,
							overflow: "hidden",
							borderRadius: 99,
							marginTop: 8,
						},
					]}
				>
					<Animated.View
						style={[
							progressBarStyle,
							{
								height: 6,
								borderRadius: 99,
							},
						]}
					/>
				</Animated.View>

				{/* Explore — appears only after bar hits 100% */}
				<Animated.View style={buttonStyle} className="mt-12">
					<TouchableOpacity
						disabled={!isComplete}
						onPress={handlePress}
						activeOpacity={0.85}
						className={"bg-green-600 px-14 py-4 rounded-2xl"}
					>
						<Text className="text-white font-bold text-lg">
							Continue
						</Text>
					</TouchableOpacity>
				</Animated.View>
			</View>

			{/* Left confetti cannon */}
			<ConfettiCannon
				ref={leftRef}
				count={120}
				origin={{ x: -10, y: height * 0.35 }}
				angle={65}
				autoStart={false}
				fadeOut
				explosionSpeed={450}
				fallSpeed={3000}
			/>
			{/* Right confetti cannon */}
			<ConfettiCannon
				ref={rightRef}
				count={120}
				origin={{ x: width + 10, y: height * 0.35 }}
				angle={115}
				autoStart={false}
				fadeOut
				explosionSpeed={450}
				fallSpeed={3000}
			/>
		</Animated.View>
	);
};
