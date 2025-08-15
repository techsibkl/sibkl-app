"use client";

import CellList from "@/components/Cells/CellList";
import SharedHeader from "@/components/shared/SharedHeader";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { Search } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Cell {
  id: string;
  name: string;
  subtitle: string;
  memberCount: number;
  backgroundColor: string;
  iconColor: string;
  members: string[];
}

const CellsScreen = () => {
  const { isDark } = useThemeColors();

  const [searchQuery, setSearchQuery] = useState("");

  // Sample data - replace with actual user's cells
  const userCells: Cell[] = [
    {
      id: "1",
      name: "Fame Fusion",
      subtitle: "Live start soon",
      memberCount: 432,
      backgroundColor: "#FFD4B3",
      iconColor: "#8B7355",
      members: ["👤", "👤", "👤", "👤"],
    },
    {
      id: "2",
      name: "Spotlight Alliance",
      subtitle: "Live start soon",
      memberCount: 432,
      backgroundColor: "#B3E5D1",
      iconColor: "#5A8B6B",
      members: ["👤", "👤", "👤", "👤"],
    },
    {
      id: "3",
      name: "Talent Tribe",
      subtitle: "Live start soon",
      memberCount: 432,
      backgroundColor: "#D4C5F9",
      iconColor: "#7B6BA8",
      members: ["👤", "👤", "👤", "👤"],
    },
    {
      id: "4",
      name: "Glamour Guild",
      subtitle: "Live start soon",
      memberCount: 432,
      backgroundColor: "#B3D9FF",
      iconColor: "#5A7BA8",
      members: ["👤", "👤", "👤", "👤"],
    },
  ];

  const filteredCells = userCells.filter((cell) =>
    cell.name.toLowerCase().includes(searchQuery.toLowerCase())
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
