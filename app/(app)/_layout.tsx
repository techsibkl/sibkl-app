import { Tabs } from "expo-router";
import {
  Circle,
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
          paddingTop: 10,
          backgroundColor: "#F2F2F7",
          borderTopWidth: 0.5,
          borderTopColor: "#E5E5EA",
        },
        headerStyle: {
          backgroundColor: "#F2F2F7",
        },
        headerTintColor: "#000",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home/index"
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
        name="cells/index"
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
        name="people/index"
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
        name="leaders/index"
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
        name="settings/index"
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
        name="people/profile/[id]"
        options={{
          href: null, // removes it from tab navigation
        }}
      />
      <Tabs.Screen
        name="cells/profile/[id]"
        options={{
          href: null, // removes it from tab navigation
        }}
      />
    </Tabs>
  );
}
