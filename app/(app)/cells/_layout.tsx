import SharedHeader from "@/components/shared/SharedHeader";
import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          header() {
            return <SharedHeader title="Cells" />;
          },
        }}
      />
      <Stack.Screen
        name="profile/[id]"
        options={({ route }) => ({
          headerShown: true,
          header() {
            return <SharedHeader title="Cell Info" isPop />;
          },
        })}
      />
      <Stack.Screen
        name="qrScan"
        options={() => ({
          headerShown: false,
          tabBarStyle: { display: "none" },
        })}
      />
      <Stack.Screen
        name="sessions/index"
        options={({ route }) => ({
          headerShown: true,
          header() {
            return <SharedHeader title="Sessions" isPop />;
          },
        })}
      />
      <Stack.Screen
        name="sessions/[sessionId]"
        options={({ route }) => ({
          headerShown: true,
          header() {
            return <SharedHeader title="Session" isPop />;
          },
        })}
      />
    </Stack>
  );
}
