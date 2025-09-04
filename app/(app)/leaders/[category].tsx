import { useCategorResourceQuery } from "@/hooks/Resource/useCategoryResroucesQuery";
import { MediaResource } from "@/services/Resource/resource.type";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CategoryResources = () => {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useCategorResourceQuery(category);
  const resources = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  // const filteredResources = useFilteredResources(resources, searchQuery);

  const filteredResources = useMemo(
    () =>
      resources.filter((r: MediaResource) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, resources]
  );

  if (isPending) {
    return <Text className="p-6">Loading...</Text>;
  }

  if (isError) {
    return <Text className="p-6 text-red-500">Error loading resources</Text>;
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-semibold text-text flex-1">
          {category} Resources
        </Text>
      </View>

      {/* Search */}
      <View className="px-4 py-3">
        <TextInput
          className="bg-white border border-gray-300 rounded-lg px-4 py-2"
          placeholder={`Search ${category}...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* List */}
      <FlashList
        data={filteredResources}
        keyExtractor={(item) => item.id.toString()}
        estimatedItemSize={80}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity className="bg-gray-100 rounded-lg p-4 mb-3 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-medium text-text mb-1">
                {item.title}
              </Text>
              <Text className="text-sm text-gray-500">
                {item.file_type} • {item.description || "No description"}
              </Text>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#007AFF" className="my-4" />
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default CategoryResources;
