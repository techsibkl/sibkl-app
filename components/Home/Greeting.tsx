import { View, Text } from "react-native";
import React from "react";

const Greeting = () => {
  return (
    <View className="mb-8">
      <Text className="font-bold mb-1 text-text text-3xl">Hi, Arshmeet!</Text>
      <Text className="text-text-secondary text-lg">
        Welcome back to SIBKL App 🙌
      </Text>
    </View>
  );
};

export default Greeting;
