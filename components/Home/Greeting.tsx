import { View, Text } from "react-native";
import React from "react";
import { useAuthStore } from "@/stores/authStore";

const Greeting = () => {
  const { user } = useAuthStore();

  return (
    <View className="mb-8">
      <Text className="font-bold mb-1 text-text text-3xl">
        Hi, {user?.person?.full_name}!
      </Text>
      <Text className="text-text-secondary text-lg">
        Welcome back to SIBKL App 🙌
      </Text>
    </View>
  );
};

export default Greeting;
