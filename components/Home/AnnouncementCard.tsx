import React from "react";
import { Text, View } from "react-native";

const AnnouncementCard = () => {
  return (
    <View className="p-5 mb-8 bg-primary-500 rounded-xl shadow-md">
      <Text className="font-bold mb-1 text-xl color-white">
        Application Design
      </Text>
      <Text className="opacity-80 mb-5 text-sm color-white">UI Design Kit</Text>

      <View className="flex-row justify-between items-center">
        <View className="flex-row">
          <View className="w-8 h-8 rounded-full border-2 bg-primary-300 border-white" />
          <View className="w-8 h-8 rounded-full border-2 -ml-2 bg-secondary-500 border-white" />
          <View className="w-8 h-8 rounded-full border-2 -ml-2 bg-secondary-300 border-white" />
        </View>
        <View className="items-end">
          <Text className="opacity-80 text-xs color-white">Progress</Text>
          <Text className="font-bold text-white">50/80</Text>
        </View>
      </View>
    </View>
  );
};

export default AnnouncementCard;
