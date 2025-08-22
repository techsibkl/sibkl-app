import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> 
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="claim" />
      <Stack.Screen name="complete-profile" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
