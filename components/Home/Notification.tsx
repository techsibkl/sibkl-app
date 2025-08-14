import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

const Notification = () => {
  return (
    <View className="flex-row justify-between items-center mb-5">
      <Text className="font-bold text-text text-xl">Notifications</Text>
      <TouchableOpacity>
        <Text className="text-text-tertiary, text-2xl">›</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Notification;
