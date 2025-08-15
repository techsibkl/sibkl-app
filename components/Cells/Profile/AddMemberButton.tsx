import { Plus } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const AddMemberButton = () => {
  return (
    <TouchableOpacity className="flex-row items-center py-3  px-4">
      <View className="w-12 h-12 rounded-full border border-border-secondary items-center justify-center mr-4">
        <Plus size={20} color="black" />
      </View>
      <View className="flex-1">
        <Text className="text-text font-semibold text-base">Add members</Text>
      </View>
    </TouchableOpacity>
  );
};

export default AddMemberButton;
