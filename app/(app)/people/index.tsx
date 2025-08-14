"use client";

import PeopleList from "@/components/People/PeopleList";
import SharedHeader from "@/components/shared/SharedHeader";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Search } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Person {
  id: string;
  fullName: string;
  phone: string;
  avatar: string;
}

const PeopleScreen = () => {
  const { isDark } = useThemeColors();

  const [searchQuery, setSearchQuery] = useState("");

  // Sample data - replace with actual contacts
  const people: Person[] = [
    {
      id: "1",
      fullName: "Maya Chen",
      phone: "+1 (555) 123-4567",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "2",
      fullName: "Zheng Yong",
      phone: "+1 (555) 234-5678",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "3",
      fullName: "Sarah Johnson",
      phone: "+1 (555) 345-6789",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "4",
      fullName: "Lai Joo Nai",
      phone: "+1 (555) 456-7890",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "5",
      fullName: "Alex Rodriguez",
      phone: "+1 (555) 567-8901",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
  ];

  const filteredPeople = people.filter(
    (person) =>
      person.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.phone.includes(searchQuery)
  );

  // const handlePersonPress = (person: Person) => {
  //   // Navigate to profile or handle person selection
  //   console.log("Opening profile for:", person.fullName);
  // };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <StatusBar
        className="bg-background dark:bg-background-dark"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <SharedHeader title="People">
        {/* Search Bar */}
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

      {/* People List */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <PeopleList people={filteredPeople} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PeopleScreen;
