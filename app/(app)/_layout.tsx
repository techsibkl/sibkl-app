import { Tabs } from "expo-router";

export default function AppLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="cell" options={{ title: "Cell" }} />
      <Tabs.Screen name="people" options={{ title: "People" }} />
      <Tabs.Screen name="leaders" options={{ title: "Leaders" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}