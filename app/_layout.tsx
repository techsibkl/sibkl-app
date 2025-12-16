import toastConfig from "@/config/toastConfig";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";

import { useFonts } from "expo-font";
import "react-native-reanimated";
import "../global.css";

import { updateDeviceToken } from "@/services/User/user.service";
import { useAuthStore } from "@/stores/authStore";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React from "react";
import { Platform, StatusBar, useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient();

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: true,
		shouldSetBadge: true,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

function handleRegistrationError(errorMessage: string) {
	alert(errorMessage);
	throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#FF231F7C",
		});
	}

	if (Device.isDevice) {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== "granted") {
			handleRegistrationError(
				"Permission not granted to get push token for push notification!"
			);
			return;
		}
		const projectId =
			Constants?.expoConfig?.extra?.eas?.projectId ??
			Constants?.easConfig?.projectId;
		if (!projectId) {
			handleRegistrationError("Project ID not found");
		}
		try {
			const pushTokenString = (
				await Notifications.getDevicePushTokenAsync()
			).data;
			console.log("Token:", pushTokenString);
			return pushTokenString;
		} catch (e: unknown) {
			handleRegistrationError(`${e}`);
		}
	} else {
		handleRegistrationError(
			"Must use physical device for push notifications"
		);
	}
}

function RootLayoutNav() {
	const segments = useSegments();
	const router = useRouter();
	const { firebaseUser, user, authLoaded, init } = useAuthStore();
	const [expoPushToken, setExpoPushToken] = useState("");
	const [notification, setNotification] = useState<
		Notifications.Notification | undefined
	>(undefined);

	useEffect(() => {
		init();
	}, [init]);

	useEffect(() => {
		// const inAuthGroup = segments[0] === "(auth)";

		if (!authLoaded) {
			// Auth not loaded yet → go to splash
			router.replace("/(auth)/splash");
		} else if (authLoaded && !firebaseUser) {
			// Unauthenticated → go to sign-in
			router.replace("/(auth)/sign-in");
		} else if (authLoaded && !user?.people_id) {
			// Incomplete profile → go to complete profile
			router.replace("/(auth)/complete-profile");
		} else if (authLoaded && user?.people_id) {
			// Already logged in → go to app
			router.replace("/(app)/home");
		}
	}, [user, authLoaded, router, firebaseUser]);

	// Register token once per user
	useEffect(() => {
		if (!firebaseUser) return;

		let isSubscribed = true;

		registerForPushNotificationsAsync()
			.then(async (token) => {
				if (!isSubscribed) return; // Prevent state update if unmounted

				const res = await updateDeviceToken(firebaseUser.uid, token);
				console.log("Updated device token:", res);
				setExpoPushToken(token ?? "");
			})
			.catch((error: any) => {
				if (isSubscribed) setExpoPushToken(`${error}`);
			});

		return () => {
			isSubscribed = false;
		};
	}, [firebaseUser?.uid]); // Only re-run if UID changes

	// Set up notification listeners separately (only once)
	useEffect(() => {
		// NavigationBar.setVisibilityAsync("hidden");
		// NavigationBar.setBehaviorAsync("overlay-swipe");

		const notificationListener =
			Notifications.addNotificationReceivedListener((notification) => {
				setNotification(notification);
				console.log("Received:", notification);
			});

		const responseListener =
			Notifications.addNotificationResponseReceivedListener(
				(response) => {
					console.log("Response", response);
				}
			);

		return () => {
			notificationListener.remove();
			responseListener.remove();
		};
	}, []); // Only run once on mount

	// Register token once per user

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
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	if (!loaded) {
		// Async font loading only occurs in development.
		return null;
	}

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider
				// value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
				value={DefaultTheme}
			>
				<RootLayoutNav />
				<StatusBar />
			</ThemeProvider>
		</QueryClientProvider>
	);
}

// IOS
// import {
// 	DarkTheme,
// 	DefaultTheme,
// 	ThemeProvider,
// } from "@react-navigation/native";
// import { useFonts } from "expo-font";
// import { Stack, useRouter, useSegments } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { useEffect, useState } from "react";
// import "react-native-reanimated";
// import "../global.css";

// import { useColorScheme } from "@/hooks/useColorScheme";
// import { updateDeviceToken } from "@/services/User/user.service";
// import { useAuthStore } from "@/stores/authStore";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import Constants from "expo-constants";
// import * as Device from "expo-device";
// import * as Notifications from "expo-notifications";
// import { Platform } from "react-native";

// const queryClient = new QueryClient();

// Notifications.setNotificationHandler({
// 	handleNotification: async () => ({
// 		shouldPlaySound: true,
// 		shouldSetBadge: true,
// 		shouldShowBanner: true,
// 		shouldShowList: true,
// 	}),
// });

// function handleRegistrationError(errorMessage: string) {
// 	alert(errorMessage);
// 	throw new Error(errorMessage);
// }

// async function registerForPushNotificationsAsync() {
// 	if (Platform.OS === "android") {
// 		await Notifications.setNotificationChannelAsync("default", {
// 			name: "default",
// 			importance: Notifications.AndroidImportance.MAX,
// 			vibrationPattern: [0, 250, 250, 250],
// 			lightColor: "#FF231F7C",
// 		});
// 	}

// 	if (Device.isDevice) {
// 		const { status: existingStatus } =
// 			await Notifications.getPermissionsAsync();
// 		let finalStatus = existingStatus;
// 		if (existingStatus !== "granted") {
// 			const { status } = await Notifications.requestPermissionsAsync();
// 			finalStatus = status;
// 		}
// 		if (finalStatus !== "granted") {
// 			handleRegistrationError(
// 				"Permission not granted to get push token for push notification!"
// 			);
// 			return;
// 		}
// 		const projectId =
// 			Constants?.expoConfig?.extra?.eas?.projectId ??
// 			Constants?.easConfig?.projectId;
// 		if (!projectId) {
// 			handleRegistrationError("Project ID not found");
// 		}
// 		try {
// 			const pushTokenString = (
// 				await Notifications.getDevicePushTokenAsync()
// 			).data;
// 			console.log("Token:", pushTokenString);
// 			return pushTokenString;
// 		} catch (e: unknown) {
// 			handleRegistrationError(`${e}`);
// 		}
// 	} else {
// 		handleRegistrationError(
// 			"Must use physical device for push notifications"
// 		);
// 	}
// }

// function RootLayoutNav() {
// 	const segments = useSegments();
// 	const router = useRouter();
// 	const { firebaseUser, user, isLoading, init } = useAuthStore();
// 	const [expoPushToken, setExpoPushToken] = useState("");
// 	const [notification, setNotification] = useState<
// 		Notifications.Notification | undefined
// 	>(undefined);

// 	useEffect(() => {
// 		init();
// 	}, [init]);

// 	useEffect(() => {
// 		if (isLoading) return;
// 		const inAuthGroup = segments[0] === "(auth)";

// 		if (!firebaseUser && !inAuthGroup) {
// 			router.replace("/(auth)/sign-in");
// 		} else if (!user && !inAuthGroup) {
// 			router.replace("/(auth)/sign-in");
// 		} else if (user && !user.person) {
// 			router.replace("/(auth)/complete-profile");
// 		} else if (user && inAuthGroup) {
// 			// Already logged in → go to app
// 			router.replace("/(app)/home");
// 		}
// 	}, [user, isLoading, segments, router, firebaseUser]);

// 	// Register token once per user
// 	useEffect(() => {
// 		if (!firebaseUser) return;

// 		let isSubscribed = true;

// 		registerForPushNotificationsAsync()
// 			.then(async (token) => {
// 				if (!isSubscribed) return; // Prevent state update if unmounted

// 				const res = await updateDeviceToken(firebaseUser.uid, token);
// 				console.log("Updated device token:", res);
// 				setExpoPushToken(token ?? "");
// 			})
// 			.catch((error: any) => {
// 				if (isSubscribed) setExpoPushToken(`${error}`);
// 			});

// 		return () => {
// 			isSubscribed = false;
// 		};
// 	}, [firebaseUser?.uid]); // Only re-run if UID changes

// 	// Set up notification listeners separately (only once)
// 	useEffect(() => {
// 		const notificationListener =
// 			Notifications.addNotificationReceivedListener((notification) => {
// 				setNotification(notification);
// 				console.log("Received:", notification);
// 			});

// 		const responseListener =
// 			Notifications.addNotificationResponseReceivedListener(
// 				(response) => {
// 					console.log("Response", response);
// 				}
// 			);

// 		return () => {
// 			notificationListener.remove();
// 			responseListener.remove();
// 		};
// 	}, []); // Only run once on mount

// 	return (
// 		<Stack screenOptions={{ headerShown: false }}>
// 			<Stack.Screen name="(auth)" options={{ headerShown: false }} />
// 			<Stack.Screen name="(app)" options={{ headerShown: false }} />
// 			<Stack.Screen name="+not-found" />
// 		</Stack>
// 	);
// }

// export default function RootLayout() {
// 	const colorScheme = useColorScheme();
// 	const [loaded] = useFonts({
// 		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
// 	});

// 	if (!loaded) {
// 		// Async font loading only occurs in development.
// 		return null;
// 	}

// 	return (
// 		<QueryClientProvider client={queryClient}>
// 			<ThemeProvider
// 				value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
// 			>
// 				<RootLayoutNav />
// 				<StatusBar style="auto" />
// 			</ThemeProvider>
// 		</QueryClientProvider>
// 	);
// }

// IOS
// import {
// 	DarkTheme,
// 	DefaultTheme,
// 	ThemeProvider,
// } from "@react-navigation/native";
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
// 			router.replace("/(auth)/sign-in");
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
// 		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
// 	});

// 	if (!loaded) {
// 		// Async font loading only occurs in development.
// 		return null;
// 	}

// 	return (
// 		<QueryClientProvider client={queryClient}>
// 			<ThemeProvider
// 				value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
// 			>
// 				<RootLayoutNav />
// 				<StatusBar style="auto" />
// 			</ThemeProvider>
// 		</QueryClientProvider>
// 	);
// }
