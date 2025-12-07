import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const Greeting = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  return (
    <View className="col">
      <Text className="font-bold mb-1 text-text text-3xl">
        Hi, {user?.person?.full_name}!
      </Text>
      <Text className="text-text-secondary text-lg">
        Welcome back to SIBKL App 🙌
      </Text>
      <TouchableOpacity onPress={() => router.push("/(app)/settings/profile")}>
        <Image
          source={require("../../assets/images/person.png")}
          className="w-20 h-20 rounded-xl"
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default Greeting;
