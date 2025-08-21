"use client";

import CellList from "@/components/Cells/CellList";
import { useSinglePersonQuery } from "@/hooks/People/useSinglePersonQuery";
import { displayDateAsStr} from "@/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Calendar, Mail, MapPin, Phone, User } from "lucide-react-native";
import type React from "react";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState("Info");
  const { id } = useLocalSearchParams();

  const {
    data: person,
    isPending,
    error,
    isError,
  } = useSinglePersonQuery(Number(id));

  const tabs = ["Info", "Cells", "Flows"];

  const renderPersonalInformation = () => (
    <View className="px-5 py-6">
      <View className="bg-white rounded-2xl p-6 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Contact Information
        </Text>

        <View className="space-y-4">
          <View className="flex-row items-center py-3 border-b border-gray-100">
            <Phone
              size={20}
              color="#d6361e" // Tailwind's primary-500 hex value
              style={{ marginRight: 12 }}
            />
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Phone</Text>
              <Text className="text-base text-gray-800 font-medium">
                {person?.phone}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center py-3 border-b border-gray-100">
            <Mail
              size={20}
              color="#d6361e" // Tailwind's primary-500 hex value
              style={{ marginRight: 12 }}
            />
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Email</Text>
              <Text className="text-base text-gray-800 font-medium">
                {person?.email}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center py-3 border-b border-gray-100">
            <MapPin
              size={20}
              color="#d6361e" // Tailwind's primary-500 hex value
              style={{ marginRight: 12 }}
            />
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Address</Text>
              <Text className="text-base text-gray-800 font-medium">
                {person?.address_line1}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center py-3 border-b border-gray-100">
            <Calendar
              size={20}
              color="#d6361e" // Tailwind's primary-500 hex value
              style={{ marginRight: 12 }}
            />
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Date of Birth</Text>
              <Text className="text-base text-gray-800 font-medium">
                {displayDateAsStr(person?.birth_date)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center py-3">
            <User
              size={20}
              color="#d6361e" // Tailwind's primary-500 hex value
              style={{ marginRight: 12 }}
            />
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Emergency Contact</Text>
              <Text className="text-base text-gray-800 font-medium">
                {person?.emergency_contact_name}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCellGroups = () => (
    <View className=" mx-6 mt-4">
      <CellList cells={person?.cells!} />
    </View>
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
        <Text>{error.message}</Text>
        <Text>{error.name}</Text>
      </SafeAreaView>
    );

  const renderFlows = () => (
    <View className="px-5 py-6">
      <View className="flex-1 justify-center items-center py-24">
        <Ionicons name="git-branch-outline" size={80} color="#666" />
        <Text className="text-2xl font-semibold text-gray-800 mt-5 mb-2">
          Flows Coming Soon
        </Text>
        <Text className="text-base text-gray-500 text-center px-10 leading-6">
          This section is being developed and will be available soon
        </Text>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Personal Information":
        return renderPersonalInformation();
      case "Cells":
        return renderCellGroups();
      case "Flows":
        return renderFlows();
      default:
        return renderPersonalInformation();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <StatusBar barStyle="dark-content" />

      <View className="justify-between flex flex-row px-4">
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Header with gradient background */}
      <View className="flex items-center justify- px-5 mb-6">
        {/* Profile Info */}
        <View className="items-center px-5">
          <Image
            source={require("../../../../assets/images/person.png")}
            className="w-24 h-24 rounded-full mb-4 border-4 border-white"
          />
          <Text className="text-2xl font-bold text-gray-800 mb-1">
            {person?.full_name}
          </Text>
        </View>
      </View>

      {/* Tabs */}

      <View className="flex-row gap justify-center">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`px-4 py-2 mr-4 rounded-full ${activeTab === tab ? "bg-primary-500" : "bg-background-secondary"}`}
          >
            <Text
              className={`font-medium ${activeTab === tab ? "text-white" : "text-gray-600"}`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
