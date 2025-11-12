import { Tabs } from "expo-router";
import {
	Circle,
	FunnelIcon,
	GraduationCap,
	Home,
	Settings,
	Users,
} from "lucide-react-native";

export default function AppLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#007AFF",
				tabBarInactiveTintColor: "#8E8E93",
				tabBarStyle: {
					height: 70,
					paddingTop: 2,
					paddingHorizontal: 16,

					borderTopWidth: 0.5,
					borderTopColor: "#E5E5EA",
				},
				headerTintColor: "#000",
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="home"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size, focused }) => (
						<Home
							size={size}
							color={color}
							strokeWidth={1}
							fill={focused ? color : "none"}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="cells"
				options={{
					title: "Cells",
					tabBarIcon: ({ color, size, focused }) => (
						<Circle
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
					title: "People",
					tabBarIcon: ({ color, size, focused }) => (
						<Users
							size={size}
							color={color}
							strokeWidth={1}
							fill={focused ? color : "none"}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="flows"
				options={{
					title: "Flows",
					tabBarIcon: ({ color, size, focused }) => (
						<FunnelIcon
							size={size}
							color={color}
							strokeWidth={1}
							fill={focused ? color : "none"}
						/>
					),
				}}
			/>
			<Tabs.Screen
				// Note: with leaders/_layout, the name just needs to be (route) and not (route)/index

				name="leaders"
				options={{
					title: "Leaders",
					tabBarIcon: ({ color, size, focused }) => (
						<GraduationCap
							size={size}
							color={color}
							strokeWidth={1}
							fill={focused ? color : "none"}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ color, size, focused }) => (
						<Settings
							size={size}
							color={color}
							strokeWidth={1}
							fill={focused ? color : "none"}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="announcements"
				options={{
					tabBarStyle: { display: "none" },
					href: null, // removes it from tab navigation
				}}
			/>
		</Tabs>
	);
}
