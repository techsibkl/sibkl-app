"use client";

import { useThemeColors } from "@/hooks/useThemeColor";
import { FlashList } from "@shopify/flash-list";
import { Search } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  StatusBar,
  Text,
  TextInput,
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

  // const renderTabContent = () => {
  //   switch (activeTab) {
  //     case "people":
  //       return (
  //         <View className="flex-1">
  //           {/* Members list */}
  //           <FlashList
  //             data={filteredMembers}
  //             keyExtractor={(item) => item.id}
  //               contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}

  //             estimatedItemSize={70}
  //             ListHeaderComponent={
  //               <>
  //                 {/* Members count */}
  //                 <View className="flex-row items-center justify-between  py-4">
  //                   <Text className="text-text text-lg font-semibold">
  //                     {filteredMembers.length} members
  //                   </Text>
  //                 </View>

  //                 {/* Search bar */}
  //                 <View className="px-2 mb-4 flex-row items-center rounded-xl bg-white border border-border">
  //                   <Search size={20} color="#999" />
  //                   <TextInput
  //                     className="flex-1 text-text-secondary text-base"
  //                     placeholder="Search members..."
  //                     placeholderTextColor="#999"
  //                     value={searchQuery}
  //                     onChangeText={setSearchQuery}
  //                   />
  //                 </View>
  //               </>
  //             }
  //             renderItem={({ item }) => (
  //               <TouchableOpacity className="flex-row items-center py-3">
  //                 <Image
  //                   source={require("../../../../assets/images/person.png")}
  //                   className="w-12 h-12 rounded-full mr-4"
  //                 />
  //                 <View className="flex-1">
  //                   <Text className="text-text font-semibold text-base">
  //                     {item.name}
  //                   </Text>
  //                   <Text className="text-text-secondary text-sm mt-1">
  //                     {item.subtitle}
  //                   </Text>
  //                 </View>
  //                 <Text className="text-text-secondary text-sm">
  //                   {item.role}
  //                 </Text>
  //                 <Text className="text-text-secondary ml-2">›</Text>
  //               </TouchableOpacity>
  //             )}
  //           />
  //         </View>
  //       );
  //     case "announcements":
  //       return (
  //         <View className="flex-1 items-center justify-center px-6">
  //           <Text className="text-gray-400 text-center">
  //             No announcements yet
  //           </Text>
  //         </View>
  //       );
  //     case "attendance":
  //       return (
  //         <View className="flex-1 items-center justify-center px-6">
  //           <Text className="text-gray-400 text-center">
  //             Attendance tracking coming soon
  //           </Text>
  //         </View>
  //       );
  //     default:
  //       return null;
  //   }
  // };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
    <StatusBar
      className="bg-background dark:bg-background-dark"
      barStyle={isDark ? "light-content" : "dark-content"}
    />

    <FlashList
      data={filteredMembers}
      keyExtractor={(item) => item.id}
      estimatedItemSize={70}
      contentContainerStyle={{ paddingBottom: 40, paddingHorizontal:16 }}
      ListHeaderComponent={
        <>
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

          {/* Action buttons */}
          <View className="flex-row justify-around px-6 py-6">
            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 bg-white border border-border rounded-full items-center justify-center mb-2">
                <Text className="text-green-500 text-xl">+</Text>
              </View>
              <Text className="text-text text-sm">Add Member</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 bg-white border border-border rounded-full items-center justify-center mb-2">
                <Text className="text-green-500 text-xl">🔍</Text>
              </View>
              <Text className="text-text text-sm">Search</Text>
            </TouchableOpacity>
          </View>

          {/* Tab bar */}
          <View className="flex-row mx- mb-6">
            {["people", "announcements", "attendance"].map((tab) => (
              <TouchableOpacity
                key={tab}
                className={`flex-1 py-3 ${
                  tab === "people" ? "rounded-l-lg border border-border" : tab === "attendance" ? "rounded-r-lg border border-border" : " border-t border-b border-border"
                } ${activeTab === tab ? "bg-background" : "bg-background-secondary"}`}
                onPress={() => setActiveTab(tab as typeof activeTab)}
              >
                <Text
                  className={`text-center text-nowrap font-medium ${
                    activeTab === tab ? "text-text" : "text-text-secondary"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Search bar */}
          <View className="px-4 mb-4 flex-row items-center rounded-xl bg-white border border-border">
            <Search size={20} color="#999" />
            <TextInput
              className="flex-1 text-text-secondary text-base"
              placeholder="Search members..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </>
      }
      renderItem={({ item }) => (
        <TouchableOpacity className="flex-row items-center py-3  px-4">
          <Image
            source={require("../../../../assets/images/person.png")}
            className="w-12 h-12 rounded-full mr-4"
          />
          <View className="flex-1">
            <Text className="text-text font-semibold text-base">
              {item.name}
            </Text>
            <Text className="text-text-secondary text-sm mt-1">
              {item.subtitle}
            </Text>
          </View>
          <Text className="text-text-secondary text-sm">{item.role}</Text>
          <Text className="text-text-secondary ml-2">›</Text>
        </TouchableOpacity>
      )}
    />
  </SafeAreaView>
  );
};

export default CellProfileScreen;
