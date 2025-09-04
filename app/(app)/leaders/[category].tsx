import { useCategorResourceQuery } from "@/hooks/Resource/useCategoryResroucesQuery";
import { MediaResource } from "@/services/Resource/resource.type";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
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

  const handleItemPress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

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
      <View className="flex-row items-center px-4 py-3 ">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-semibold text-text flex-1">
          {category} Resources
        </Text>
      </View>

      {/* Search */}
      <View className="px-5 pb-2">
        <View className="flex-row items-center rounded-xl px-4 py-3 bg-white border border-border">
          <Search size={20} color="#999" />
          <TextInput
            className="flex-1 text-text-secondary text-base ml-3"
            placeholder={`Search ${category}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* List */}
      <FlashList
        data={filteredResources}
        keyExtractor={(item) => item.id.toString()}
        estimatedItemSize={80}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-background border-border border rounded-lg p-4 mb-3 flex-row items-center justify-between"
            onPress={() => handleItemPress(item.drive_view_link)}
          >
            <View className="flex-1">
              <Image
                source={{
                  uri: item.thumbnail_id
                    ? `https://drive.google.com/thumbnail?id=${item.thumbnail_id}`
                    : `https://drive.google.com/thumbnail?id=${item.drive_file_id}`,
                }}
                className="w-full h-56 rounded-lg mb-3"
                resizeMode="contain"
              />
              <Text
                className="text-base font-medium text-text mb-1"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>
              <Text
                className="text-xs text-gray-500"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.file_type === "PDF" ? "PDF Document" : "Video"}
              </Text>
              <Text
                className="text-sm text-gray-500"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.description || "No description"}
              </Text>
            </View>
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
