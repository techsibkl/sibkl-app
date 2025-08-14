import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { FlashList } from "@shopify/flash-list";
import { ChevronRightIcon } from "lucide-react-native";
import CategoryItemsList from "./CategoryItemsList";

type CategoryListProps = {
  categories: any[];
};

const CategoryList = ({ categories }: CategoryListProps) => {
  return (
    <FlashList
      data={categories}
      keyExtractor={(_, index) => index.toString()}
      estimatedItemSize={200} // tune this for better perf
      renderItem={({ item: category }) => (
        <View className="mb-8">
          {/* Category Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-secondary text-xl font-bold">
              {category.title}
            </Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-text-secondary/60 text-sm mr-1">
                See All
              </Text>
              <ChevronRightIcon size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Category Items */}
          <CategoryItemsList items={category.items} />
        </View>
      )}
    />
  );
};

export default CategoryList;
