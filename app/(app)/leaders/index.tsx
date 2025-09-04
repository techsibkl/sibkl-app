"use client";

import CategoryList from "@/components/Leaders/CategoryList";
import SharedHeader from "@/components/shared/SharedHeader";
import { useFilteredResources } from "@/hooks/Resource/useFilteredResources";
import { useResourcesQuery } from "@/hooks/Resource/useResourceQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ScrollView, StatusBar, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LeadersPage = () => {
  const { isDark } = useThemeColors();
  const { data: resources, isPending, isError} = useResourcesQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const groupedResources = useFilteredResources(resources, searchQuery);

  // const grouped
  if (isPending) {
    return <Text>Loading...</Text>;
  }

  if (isError || !resources) {
    return <Text>Error loading resources</Text>;
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <StatusBar
        className="bg-background dark:bg-background-dark"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <SharedHeader title="Leaders">
        <Text className="text-text-secondary text-lg font-medium">
          Resources
        </Text>
        <View className="flex-row items-center rounded-xl px-4 py-3 bg-white border border-border">
          <Search size={20} color="#999" />
          <TextInput
            className="flex-1 text-text-secondary text-base ml-3"
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </SharedHeader>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <CategoryList categories={groupedResources} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default LeadersPage;
