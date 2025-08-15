"use client";

import MembersList from "@/components/Cells/Profile/MembersList";
import ComingSoon from "@/components/shared/ComingSoon";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  subtitle: string;
}

const CellProfileScreen = () => {
  const { isDark } = useThemeColors();

  const [activeTab, setActiveTab] = useState<
    "people" | "announcements" | "attendance"
  >("people");
  const [searchQuery, setSearchQuery] = useState("");

  const members: Member[] = [
    {
      id: "1",
      name: "You",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Cell Leader",
      subtitle: "Love • Jesus • Ambassador",
    },
    {
      id: "2",
      name: "Pastor Miranda",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Cell owner",
      subtitle: "When we're hungry...",
    },
    {
      id: "3",
      name: "Elysse Goh",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Cell admin",
      subtitle: "nothing i hold on to",
    },
    {
      id: "4",
      name: "Mary (GG)",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Member",
      subtitle: "Blessed to be a blessing",
    },
    {
      id: "5",
      name: "John Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Member",
      subtitle: "Walking in faith",
    },
  ];

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "people":
        return (
          <MembersList
            members={filteredMembers}
            searchQuery={searchQuery}
            onChangeText={setSearchQuery}
          />
        );
      case "announcements":
        return <ComingSoon description="Announcements coming soon" />;
      case "attendance":
        return <ComingSoon description="Attendance tracking coming soon" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <StatusBar
        className="bg-background dark:bg-background-dark"
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      <View className="justify-between flex flex-row px-4">
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>Edit</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {/* Cell info section */}
        <View className="items-center py-8">
          <View className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center mb-6">
            <Text className="text-white text-2xl font-bold">tc</Text>
          </View>
          <Text className="text-text text-2xl font-bold text-center mb-2">
            SIBKL Campus Serving Teams
          </Text>
          <Text className="text-text-secondary text-base">
            Cell • {members.length} members
          </Text>
        </View>

        {/* Tab bar */}
        <View className="flex-row mx-6 mb-6">
          {["people", "announcements", "attendance"].map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-3 ${
                tab === "people"
                  ? "rounded-l-lg border border-border"
                  : tab === "attendance"
                    ? "rounded-r-lg border border-border"
                    : " border-t border-b border-border"
              } ${activeTab === tab ? "bg-background" : "bg-background-secondary"}`}
              onPress={() => setActiveTab(tab as typeof activeTab)}
            >
              <Text
                className={`text-center text-sm text-nowrap font-medium ${
                  activeTab === tab ? "text-text" : "text-text-secondary"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CellProfileScreen;
