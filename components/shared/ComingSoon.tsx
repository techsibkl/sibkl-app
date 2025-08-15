import { View, Text } from "react-native";
import React from "react";

type ComingSoonProps = {
    description: string
}

const ComingSoon = ({description} : ComingSoonProps) => {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-gray-400 text-center">{description}</Text>
    </View>
  );
};

export default ComingSoon;
