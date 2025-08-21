"use client";

import PeopleList from "@/components/People/PeopleList";
import SharedHeader from "@/components/shared/SharedHeader";
import { usePeopleQuery } from "@/hooks/People/usePeopleQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Search } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  TextInput,
  View,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PeopleScreen = () => {
  const { isDark } = useThemeColors();
  const { data: people, isPending, error, isError } = usePeopleQuery();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredPeople = (people ?? []).filter(
    (person) =>
      person?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person?.phone?.includes(searchQuery)
  );

  // const handlePersonPress = (person: Person) => {
  //   // Navigate to profile or handle person selection
  //   console.log("Opening profile for:", person.fullName);
  // };

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
