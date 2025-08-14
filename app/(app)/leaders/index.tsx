"use client";

import CategoryList from "@/components/Leaders/CategoryList";
import SharedHeader from "@/components/shared/SharedHeader";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Search } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LeadersPage = () => {
  const { isDark } = useThemeColors();

  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Discipleship",
      items: [
        {
          title: "Growing in Faith",
          type: "pdf",
          url: "https://example.com/discipleship1.pdf",
        },
        {
          title: "Prayer Life",
          type: "pdf",
          url: "https://example.com/discipleship2.pdf",
        },
        {
          title: "Bible Study Methods",
          type: "url",
          url: "https://example.com/bible-study",
        },
      ],
    },
    {
      title: "Cell Notes",
      items: [
        {
          title: "Week 1: Community",
          type: "pdf",
          url: "https://example.com/cell1.pdf",
        },
        {
          title: "Week 2: Fellowship",
          type: "pdf",
          url: "https://example.com/cell2.pdf",
        },
        {
          title: "Week 3: Growth",
          type: "pdf",
          url: "https://example.com/cell3.pdf",
        },
      ],
    },
    {
      title: "Sermon Notes",
      items: [
        {
          title: "Justice Series - Part 1",
          type: "pdf",
          url: "https://example.com/sermon1.pdf",
        },
        {
          title: "Love in Action",
          type: "pdf",
          url: "https://example.com/sermon2.pdf",
        },
        {
          title: "Faith and Works",
          type: "url",
          url: "https://example.com/sermon3",
        },
      ],
    },
    {
      title: "Volunteer Information",
      items: [
        {
          title: "Volunteer Handbook",
          type: "pdf",
          url: "https://example.com/volunteer-handbook.pdf",
        },
        {
          title: "Ministry Opportunities",
          type: "url",
          url: "https://example.com/ministries",
        },
        {
          title: "Training Schedule",
          type: "pdf",
          url: "https://example.com/training.pdf",
        },
      ],
    },
    {
      title: "Policies",
      items: [
        {
          title: "Child Protection Policy",
          type: "pdf",
          url: "https://example.com/child-protection.pdf",
        },
        {
          title: "Code of Conduct",
          type: "pdf",
          url: "https://example.com/code-conduct.pdf",
        },
        {
          title: "Privacy Policy",
          type: "url",
          url: "https://example.com/privacy",
        },
      ],
    },
    {
      title: "Events",
      items: [
        {
          title: "Upcoming Conferences",
          type: "url",
          url: "https://example.com/conferences",
        },
        {
          title: "Community Outreach",
          type: "pdf",
          url: "https://example.com/outreach.pdf",
        },
        {
          title: "Youth Events",
          type: "url",
          url: "https://example.com/youth-events",
        },
      ],
    },
  ];

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
        <CategoryList categories={categories} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default LeadersPage;
