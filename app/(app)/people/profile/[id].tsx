"use client";

import CellList from "@/components/Cells/CellList";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, Mail, MapPin, Phone, User } from "lucide-react-native";
import type React from "react";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

interface ProfileScreenProps {
  userId?: string;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState("Info");

  // Sample profile data - would be fetched based on userId
  const profileData = {
    name: "Amanda Smith",
    username: "@amandasmith",
    avatar: "/placeholder.svg?height=120&width=120",
    phone: "+1 (555) 123-4567",
    email: "amanda.smith@example.com",
    address: "123 Main St, City, State 12345",
    dateOfBirth: "March 15, 1990",
    occupation: "Product Designer",
    emergencyContact: "John Smith - +1 (555) 987-6543",
  };

  // Sample cells data for this user
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
  ];

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
                {profileData.phone}
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
                {profileData.email}
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
                {profileData.address}
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
                {profileData.dateOfBirth}
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
                {profileData.emergencyContact}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCellGroups = () => (
    <View className=" mx-6 mt-4">
      <CellList cells={userCells} />
    </View>
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
            {profileData.name}
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
