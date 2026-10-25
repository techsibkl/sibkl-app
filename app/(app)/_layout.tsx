import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { useAuthStore } from "@/stores/authStore";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Tabs } from "expo-router";
import {
	Calendar,
	Circle,
	Ellipsis,
	Home,
} from "lucide-react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CAMERA_ROUTES = new Set(["scanner", "qrScan"]);
// this is used to hide the tab bar on camera routes
// getFocusedRouteNameFromRoute is used to get the name of the current route

export default function AppLayout() {
	const insets = useSafeAreaInsets();
	const isGuest = useAuthStore((s) => s.isGuest);
	const showEventsTab = useFeatureFlag("events") && !isGuest;
	const showCells = useFeatureFlag("cells");
	const defaultTabBarStyle = {
		height: 50 + Math.max(insets.bottom, 8),
		paddingTop: 2,
		paddingHorizontal: 16,
		borderTopWidth: 0.5,
		borderTopColor: "#E5E5EA",
	};
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#007AFF",
				tabBarInactiveTintColor: "#8E8E93",
				tabBarStyle: defaultTabBarStyle,
				headerTintColor: "#000",
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="home"
				options={({ route }) => {
					const routeName =
						getFocusedRouteNameFromRoute(route) ?? "index";
					return {
						title: "Home",
						tabBarStyle:
							routeName === "launch"
								? { display: "none" }
								: defaultTabBarStyle,
						tabBarIcon: ({ color, size, focused }) => (
							<Home
								size={size}
								color={color}
								strokeWidth={1}
								fill={focused ? color : "none"}
							/>
						),
					};
				}}
			/>
			<Tabs.Screen
				name="cells"
				options={({ route }) => {
					const routeName =
						getFocusedRouteNameFromRoute(route) ?? "index";
					return {
						title: "Cells",
						href: showCells ? "/(app)/cells" : null,
						tabBarStyle: CAMERA_ROUTES.has(routeName)
							? { display: "none" }
							: defaultTabBarStyle,
						tabBarIcon: ({ color, size, focused }) => (
							<Circle
								size={size}
								color={color}
								strokeWidth={1}
								fill={focused ? color : "none"}
							/>
						),
					};
				}}
			/>
			<Tabs.Screen
				name="events"
				options={({ route }) => {
					const routeName =
						getFocusedRouteNameFromRoute(route) ?? "index";
					return {
						title: "Events",
						href: showEventsTab ? ("/(app)/events" as any) : null,

						tabBarStyle: CAMERA_ROUTES.has(routeName)
							? { display: "none" }
							: defaultTabBarStyle,
						tabBarIcon: ({ color, size, focused }) => (
							<Calendar
								size={size}
								color={color}
								strokeWidth={1}
								fill={focused ? color : "none"}
							/>
						),
					};
				}}
			/>
			<Tabs.Screen
				name="more"
				options={{
					title: "More",
					tabBarIcon: ({ color, size, focused }) => (
						<Ellipsis
							size={size}
							color={color}
							strokeWidth={1}
							fill={focused ? color : "none"}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="people"
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name="flows"
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name="leaders"
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					href: null,
				}}
			/>

			<Tabs.Screen
				name="announcements"
				options={{
					tabBarStyle: { display: "none" },
					href: null, // removes it from tab navigation
				}}
			/>
			<Tabs.Screen
				name="notifications"
				options={{
					tabBarStyle: { display: "none" },
					href: null, // removes it from tab navigation
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					tabBarStyle: { display: "none" },
					href: null, // hides it from tab bar
				}}
			/>
		</Tabs>
	);
}
