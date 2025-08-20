"use client";

import CellList from "@/components/Cells/CellList";
import SharedHeader from "@/components/shared/SharedHeader";
import { useCellsQuery } from "@/hooks/Cell/useCellQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Search } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CellsScreen = () => {
  const { isDark } = useThemeColors();

  const { data: cells , isPending, error, isError } = useCellsQuery();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredCells = (cells ?? []).filter((cell) =>
    cell?.cell_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isPending)
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
        <ActivityIndicator />
      </SafeAreaView>
    );
  if (isError)
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
        {/* <Text>{JSON.stringify(error)}</Text> */}
        <Text>{error.message}</Text>
        <Text>{error.name}</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <StatusBar
        className="bg-background dark:bg-background-dark"
        barStyle={isDark ? "light-content" : "dark-content"}
      />
    
      {/* Header with Search */}
      <SharedHeader title="Cells">
        <View className="flex-row items-center rounded-xl px-4 py-3 bg-white border border-border">
          <Search size={20} color="#999" className="mr-2" />
          <TextInput
            className="flex-1 text-text-secondary text-base"
            placeholder="Search cells..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </SharedHeader>

      {/* Content */}
      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <CellList cells={filteredCells} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CellsScreen;
