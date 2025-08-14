import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

const Header = () => {
  return (
    <View className="flex-row justify-between items-center px-5 pb-5 pt-8">
      <TouchableOpacity className="w-8 h-8 rounded-full justify-center items-center bg-gray-300 shadow-sm">
        <View className="w-5 h-5 rounded-full bg-gray-600" />
      </TouchableOpacity>

      <Text className="font-semibold dark:text-text-dark-primary text-xl">
        Friday, 20
      </Text>

      <TouchableOpacity className="w-8 h-8 justify-center items-center">
        <Text className="text-text-secondary dark:text-text-dark-secondary text-xl">
          ⏰
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Header;
