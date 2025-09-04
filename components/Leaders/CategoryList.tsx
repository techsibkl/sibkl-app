import { MediaResource } from "@/services/Resource/resource.type";
import { FlashList } from "@shopify/flash-list";
import { ChevronRightIcon } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import CategoryItemsList from "./CategoryItemsList";

type CategoryListProps = {
  groupedResources: { category: string; items: MediaResource[] }[];
};

const CategoryList = ({ groupedResources }: CategoryListProps) => {
  return (
    <>
      <FlashList
        data={groupedResources}
        keyExtractor={(_, index) => index.toString()}
        estimatedItemSize={200} // tune this for better perf
        renderItem={({ item: group }) => (
          <View className="mb-8">
            {/* Category Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-text-secondary text-xl font-bold">
                {group.category}
              </Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-text-secondary/60 text-sm mr-1">
                  See All
                </Text>
                <ChevronRightIcon size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Category Items */}
            <CategoryItemsList items={group.items.slice(0, 3)} />
          </View>
        )}
      />
    </>
  );
};

export default CategoryList;
