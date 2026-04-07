import toastConfig from "@/config/toastConfig";
import { updateDeviceToken } from "@/services/User/user.service";
import { useAuthStore } from "@/stores/authStore";
import { getApp } from "@react-native-firebase/app";
import {
	AuthorizationStatus,
	getInitialNotification,
	getMessaging,
	getToken,
	onMessage,
	onNotificationOpenedApp,
	requestPermission,
	setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Device from "expo-device";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";
import "../global.css";

const queryClient = new QueryClient();

// ─── Module-level messaging instance ─────────────────────────────────────────
const messagingInstance = getMessaging(getApp());

// ─── Must be at file root, outside any component ──────────────────────────────
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: true,
		shouldSetBadge: true,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
	console.log("[FCM] Background:", remoteMessage);
});
// ─────────────────────────────────────────────────────────────────────────────

async function registerAndGetToken(): Promise<string | null> {
	if (!Device.isDevice) {
		console.warn("[FCM] Push notifications require a physical device");
		return null;
	}

	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#FF231F7C",
		});
	}

	// Handles APNs registration on iOS automatically
	const authStatus = await requestPermission(messagingInstance);
	const granted =
		authStatus === AuthorizationStatus.AUTHORIZED ||
		authStatus === AuthorizationStatus.PROVISIONAL;

	if (!granted) {
		console.warn("[FCM] Permission denied:", authStatus);
		return null;
	}

	const token = await getToken(messagingInstance);
	console.log("[FCM] Token:", token);
	return token;
}

function RootLayoutNav() {
	const router = useRouter();
	const { firebaseUser, user, authLoaded, init } = useAuthStore();

	// Auth init
	useEffect(() => {
		init();
	}, [init]);

	// Auth routing
	useEffect(() => {
		if (!authLoaded) {
			router.replace("/(auth)/splash");
		} else if (!firebaseUser) {
			router.replace("/(auth)/sign-in");
		} else if (!user?.people_id) {
			router.replace("/(auth)/complete-profile");
		} else {
			router.replace("/(app)/home");
		}
	}, [user, authLoaded, router, firebaseUser]);

	// Register + save token when user logs in
	useEffect(() => {
		if (!firebaseUser) return;

		let active = true;

		registerAndGetToken()
			.then(async (token) => {
				if (!active || !token) return;
				const res = await updateDeviceToken(firebaseUser.uid, token);
				console.log("[FCM] Device token updated:", res);
			})
			.catch((err) =>
				console.error("[FCM] Token registration error:", err),
			);

		return () => {
			active = false;
		};
	}, [firebaseUser?.uid]);

	// Notification listeners
	useEffect(() => {
		// Foreground
		const unsubscribeForeground = onMessage(
			messagingInstance,
			async (msg) => {
				console.log("[FCM] Foreground:", msg);
			},
		);

		// Background → foreground tap
		const unsubscribeOpened = onNotificationOpenedApp(
			messagingInstance,
			(msg) => {
				console.log("[FCM] Background→foreground tap:", msg);
			},
		);

		// Quit state — app opened from notification
		getInitialNotification(messagingInstance).then((msg) => {
			if (msg) console.log("[FCM] Quit state:", msg);
		});

		return () => {
			unsubscribeForeground();
			unsubscribeOpened();
		};
	}, []);

	return (
		<PaperProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(auth)" options={{ headerShown: false }} />
				<Stack.Screen name="(app)" options={{ headerShown: false }} />
				<Stack.Screen name="+not-found" />
			</Stack>
			<Toast config={toastConfig} />
		</PaperProvider>
	);
}

export default function RootLayout() {
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	if (!loaded) return null;

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider value={DefaultTheme}>
				<RootLayoutNav />
				<StatusBar />
			</ThemeProvider>
		</QueryClientProvider>
	);
}

// IOS
// import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
// import { useFonts } from "expo-font";
// import { Stack, useRouter } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { useEffect } from "react";
// import "react-native-reanimated";
// import "../global.css";

// import toastConfig from "@/config/toastConfig";
// import { useColorScheme } from "@/hooks/useColorScheme";
// import { useAuthStore } from "@/stores/authStore";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import React from "react";
// import { PaperProvider } from "react-native-paper";
// import Toast from "react-native-toast-message";

// const queryClient = new QueryClient();

// function RootLayoutNav() {
// 	// const segments = useSegments();
// 	const router = useRouter();
// 	const { firebaseUser, user, authLoaded, init, ability } = useAuthStore();

// 	useEffect(() => {
// 		init();
// 	}, [init]);

// 	useEffect(() => {
// 		// const inAuthGroup = segments[0] === "(auth)";

// 		if (!authLoaded) {
// 			// Auth not loaded yet → go to splash
// 			router.replace("/(auth)/splash");
// 		} else if (authLoaded && !firebaseUser) {
// 			// Unauthenticated → go to sign-in
// 			router.replace("/(auth)/sign-up");
// 		} else if (authLoaded && !user?.people_id) {
// 			// Incomplete profile → go to complete profile
// 			router.replace("/(auth)/complete-profile");
// 		} else if (authLoaded && user?.people_id) {
// 			// Already logged in → go to app
// 			router.replace("/(app)/home");
// 		}
// 	}, [user, authLoaded, router, firebaseUser]);

// 	// Register token once per user

// 	return (
// 		<PaperProvider>
// 			<Stack screenOptions={{ headerShown: false }}>
// 				<Stack.Screen name="(auth)" options={{ headerShown: false }} />
// 				<Stack.Screen name="(app)" options={{ headerShown: false }} />
// 				<Stack.Screen name="+not-found" />
// 			</Stack>
// 			<Toast config={toastConfig} />
// 		</PaperProvider>
// 	);
// }

// export default function RootLayout() {
// 	const colorScheme = useColorScheme();
// 	const [loaded] = useFonts({
// 		"FunnelSans-Light": require("../assets/fonts/FunnelSans/static/FunnelSans-Light.ttf"),
// 		"FunnelSans-Medium": require("../assets/fonts/FunnelSans/static/FunnelSans-Medium.ttf"),
// 		"FunnelSans-Regular": require("../assets/fonts/FunnelSans/static/FunnelSans-Regular.ttf"),
// 		"FunnelSans-SemiBold": require("../assets/fonts/FunnelSans/static/FunnelSans-SemiBold.ttf"),
// 		"FunnelSans-Bold": require("../assets/fonts/FunnelSans/static/FunnelSans-Bold.ttf"),
// 		"FunnelSans-ExtraBold": require("../assets/fonts/FunnelSans/static/FunnelSans-ExtraBold.ttf"),
// 		"FunnelSans-Italic": require("../assets/fonts/FunnelSans/static/FunnelSans-Italic.ttf"),
// 	});

// 	if (!loaded) {
// 		// Async font loading only occurs in development.
// 		return null;
// 	}

// 	return (
// 		<QueryClientProvider client={queryClient}>
// 			<ThemeProvider value={DefaultTheme}>
// 				<RootLayoutNav />
// 				<StatusBar style="auto" />
// 			</ThemeProvider>
// 		</QueryClientProvider>
// 	);
// }
