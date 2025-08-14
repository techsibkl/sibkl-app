import { FlashList } from "@shopify/flash-list";
import { ChevronRightIcon } from "lucide-react-native";
import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

type CategoryItemsListProps = {
  items: any[];
};

const CategoryItemsList = ({ items }: CategoryItemsListProps) => {

  const handleItemPress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };
  
  return (
    <FlashList
      data={items}
      keyExtractor={(_, index) => index.toString()}
      estimatedItemSize={70}
      renderItem={({ item }) => (
        <TouchableOpacity
          className="bg-background border-border border rounded-lg p-4 flex-row items-center justify-between mb-3"
          onPress={() => handleItemPress(item.url)}
        >
          <View className="flex-1">
            <Text className="text-text text-base font-medium mb-1">
              {item.title}
            </Text>
            <Text className="text-text-secondary text-sm capitalize">
              {item.type === "pdf" ? "PDF Document" : "Web Resource"}
            </Text>
          </View>
          <View className="ml-3">
            <ChevronRightIcon size={20} color="#6B7280" />
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

export default CategoryItemsList;
