import { appStoreBadgeXml } from "@/components/AppUpdate/appStoreBadgeXml";
import { useSystemStore } from "@/stores/systemStore";
import { AppStoreVersion } from "@/types/SystemConfig";
import React, { useEffect } from "react";
import {
	BackHandler,
	Image,
	Linking,
	Modal,
	Platform,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Animated, {
	cancelAnimation,
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";

const IOS_STORE_URL = "https://apps.apple.com/us/app/sibkl-app/id6762274718";
const ANDROID_STORE_URL =
	"https://play.google.com/store/apps/details?id=com.sibkl.app";
const DEFAULT_TITLE = "Don't Miss the Latest Version";
const BADGE_HEIGHT = 54;
const APP_STORE_BADGE_WIDTH = BADGE_HEIGHT * (119.66407 / 40);
const PLAY_BADGE_WIDTH = BADGE_HEIGHT * (478 / 142);

function formatUpdatedOn(value: string | null): string | null {
	if (!value) return null;
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
	if (!match) return null;
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const date = new Date(year, month - 1, day);
	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		return null;
	}
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

function storeUrl(version: AppStoreVersion | null): string {
	if (Platform.OS === "ios") return version?.ios_store_url || IOS_STORE_URL;
	return version?.android_store_url || ANDROID_STORE_URL;
}

export function AppUpdatePrompt() {
	const needsAppUpdate = useSystemStore((state) => state.needsAppUpdate);
	const appVersion = useSystemStore((state) => state.appVersion);
	const dismissAppUpdate = useSystemStore((state) => state.dismissAppUpdate);
	const insets = useSafeAreaInsets();
	const shineX = useSharedValue(-200);

	useEffect(() => {
		if (!needsAppUpdate) return;
		const subscription = BackHandler.addEventListener(
			"hardwareBackPress",
			() => {
				dismissAppUpdate();
				return true;
			},
		);
		return () => subscription.remove();
	}, [dismissAppUpdate, needsAppUpdate]);

	useEffect(() => {
		if (!needsAppUpdate) {
			cancelAnimation(shineX);
			shineX.value = -200;
			return;
		}
		shineX.value = withRepeat(
			withSequence(
				withTiming(230, {
					duration: 1200,
					easing: Easing.out(Easing.cubic),
				}),
				withDelay(1700, withTiming(-200, { duration: 0 })),
			),
			-1,
			false,
		);
		return () => cancelAnimation(shineX);
	}, [needsAppUpdate, shineX]);

	const shineStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: shineX.value }, { rotate: "18deg" }],
	}));

	if (!needsAppUpdate) return null;

	const title = appVersion?.title?.trim() || DEFAULT_TITLE;
	const storeVersion = appVersion?.version?.replace(/^v/i, "").trim();
	const updatedOn = formatUpdatedOn(appVersion?.released_on ?? null);
	const isIos = Platform.OS === "ios";

	const openStore = () => {
		const url = storeUrl(appVersion);
		Linking.openURL(url).catch((error) => {
			console.warn("[AppUpdatePrompt] Failed to open store:", error);
		});
	};

	return (
		<Modal
			visible
			animationType="fade"
			presentationStyle="fullScreen"
			statusBarTranslucent
			transparent={false}
			onRequestClose={dismissAppUpdate}
		>
			<StatusBar barStyle="light-content" />
			<View style={styles.screen}>
				<View
					style={[
						styles.content,
						{
							paddingTop: insets.top + 12,
							paddingBottom: Math.max(insets.bottom, 16),
						},
					]}
				>
					<View style={styles.main}>
						<Text style={styles.title}>{title}</Text>

						<View style={styles.iconBlock}>
							<View style={styles.iconHalo} />
							<View style={styles.iconClip}>
								<Image
									source={require("../../assets/images/sibkl-app-icon.png")}
									style={styles.icon}
								/>
								<Animated.View
									pointerEvents="none"
									style={[styles.shine, shineStyle]}
								>
									<View style={styles.shineSoft} />
									<View style={styles.shineCore} />
								</Animated.View>
							</View>
						</View>

						<Text style={styles.appName}>SIBKL App</Text>
						{storeVersion ? (
							<Text style={styles.version}>
								Version {storeVersion}
							</Text>
						) : null}
						{updatedOn ? (
							<Text style={styles.updated}>
								Updated {updatedOn}
							</Text>
						) : (
							<View style={styles.updatedSpacer} />
						)}

						<TouchableOpacity
							activeOpacity={0.85}
							onPress={openStore}
							style={styles.badgeHit}
							accessibilityRole="button"
							accessibilityLabel={
								isIos
									? "Download on the App Store"
									: "Get it on Google Play"
							}
						>
							{isIos ? (
								<SvgXml
									xml={appStoreBadgeXml}
									width={APP_STORE_BADGE_WIDTH}
									height={BADGE_HEIGHT}
								/>
							) : (
								<Image
									source={require("../../assets/images/GetItOnGooglePlay_Badge_Web_color_English.png")}
									style={styles.playBadge}
									resizeMode="contain"
								/>
							)}
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						onPress={dismissAppUpdate}
						style={styles.closeHit}
						accessibilityRole="button"
						accessibilityLabel="Close"
					>
						<Text style={styles.close}>Close</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#8C1E16",
	},
	content: {
		flex: 1,
		paddingHorizontal: 28,
	},
	main: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		color: "#fff",
		fontSize: 34,
		lineHeight: 42,
		fontWeight: "700",
		textAlign: "center",
		maxWidth: 300,
		marginBottom: 36,
	},
	iconBlock: {
		width: 176,
		height: 176,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 28,
	},
	iconHalo: {
		position: "absolute",
		width: 176,
		height: 176,
		borderRadius: 40,
		backgroundColor: "rgba(255, 214, 196, 0.28)",
	},
	// iconShadow: {
	// 	borderRadius: 40,
	// 	shadowColor: "#fff",
	// 	shadowOpacity: 0.45,
	// 	shadowRadius: 16,
	// 	shadowOffset: { width: 0, height: 6 },
	// 	elevation: 8,
	// },
	iconClip: {
		width: 176,
		height: 176,
		borderRadius: 40,
		overflow: "hidden",
		backgroundColor: "#A61E0F",
	},
	icon: {
		width: 176,
		height: 176,
	},
	shine: {
		position: "absolute",
		top: -40,
		width: 70,
		height: 260,
	},
	shineSoft: {
		position: "absolute",
		width: 70,
		height: 260,
		backgroundColor: "rgba(255,255,255,0.16)",
	},
	shineCore: {
		position: "absolute",
		left: 22,
		width: 22,
		height: 260,
		backgroundColor: "rgba(255,255,255,0.55)",
	},
	appName: {
		color: "#fff",
		fontSize: 22,
		fontWeight: "700",
		letterSpacing: 0.2,
	},
	version: {
		marginTop: 6,
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	updated: {
		marginTop: 6,
		color: "rgba(255,255,255,0.88)",
		fontSize: 16,
		fontWeight: "400",
	},
	updatedSpacer: {
		height: 22,
	},
	badgeHit: {
		marginTop: 36,
	},
	playBadge: {
		width: PLAY_BADGE_WIDTH,
		height: BADGE_HEIGHT,
	},
	closeHit: {
		alignItems: "center",
		paddingVertical: 12,
	},
	close: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "500",
	},
});
