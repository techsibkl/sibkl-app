import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const Page = () => {
  const router = useRouter();

  const handleVerify = () => {
    console.log("verifying email...");
    router.push("/(auth)/sign-in");
  };

  return (
    <View>
      <Text>Verify Email Page</Text>
      <TouchableOpacity
        className="h-40 bg-primary-500 text-white"
        onPress={handleVerify}
      >
        I&apos;ve verified my email
      </TouchableOpacity>
    </View>
  );
};

export default Page;
