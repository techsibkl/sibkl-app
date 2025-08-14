"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

interface Cell {
  id: string
  name: string
  subtitle: string
  memberCount: number
  backgroundColor: string
  iconColor: string
  members: string[]
}

interface ProfileScreenProps {
  userId?: string
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState("Personal Information")

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
  }

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
  ]

  const tabs = ["Personal Information", "Cell Groups", "Flows"]

  const renderPersonalInformation = () => (
    <View className="px-5 py-6">
      <View className="bg-white rounded-2xl p-6 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800 mb-4">Contact Information</Text>

        <View className="space-y-4">
          <View className="flex-row items-center py-3 border-b border-gray-100">
            <Ionicons name="call-outline" size={20} color="#699EFF" className="mr-3" />
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Phone</Text>
              <Text className="text-base text-gray-800 font-medium">{profileData.phone}</Text>
            </View>
          </View>

          <View className="flex-row items-center py-3 border-b border-gray-100">
            <Ionicons name="mail-outline" size={20} color="#699EFF" className="mr-3" />
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Email</Text>
              <Text className="text-base text-gray-800 font-medium">{profileData.email}</Text>
            </View>
          </View>

          <View className="flex-row items-center py-3 border-b border-gray-100">
            <Ionicons name="location-outline" size={20} color="#699EFF" className="mr-3" />
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Address</Text>
              <Text className="text-base text-gray-800 font-medium">{profileData.address}</Text>
            </View>
          </View>

          <View className="flex-row items-center py-3 border-b border-gray-100">
            <Ionicons name="calendar-outline" size={20} color="#699EFF" className="mr-3" />
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Date of Birth</Text>
              <Text className="text-base text-gray-800 font-medium">{profileData.dateOfBirth}</Text>
            </View>
          </View>

          <View className="flex-row items-center py-3 border-b border-gray-100">
            <Ionicons name="briefcase-outline" size={20} color="#699EFF" className="mr-3" />
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Occupation</Text>
              <Text className="text-base text-gray-800 font-medium">{profileData.occupation}</Text>
            </View>
          </View>

          <View className="flex-row items-center py-3">
            <Ionicons name="person-outline" size={20} color="#699EFF" className="mr-3" />
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Emergency Contact</Text>
              <Text className="text-base text-gray-800 font-medium">{profileData.emergencyContact}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )

  const renderCellGroups = () => (
    <View className="px-5 py-6">
      {userCells.length > 0 ? (
        <View>
          {userCells.map((cell) => (
            <TouchableOpacity
              key={cell.id}
              className="rounded-2xl p-5 mb-4"
              style={{ backgroundColor: cell.backgroundColor }}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-12 h-12 rounded-full justify-center items-center mr-4"
                    style={{ backgroundColor: cell.iconColor }}
                  >
                    <Ionicons name="people" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800 mb-1">{cell.name}</Text>
                    <Text className="text-sm text-gray-600">{cell.subtitle}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-4">
                  <View className="items-center">
                    <View className="flex-row items-center mb-1">
                      {cell.members.slice(0, 4).map((member, index) => (
                        <View
                          key={index}
                          className="w-8 h-8 rounded-full bg-white justify-center items-center border-2 border-white"
                          style={{ marginLeft: index > 0 ? -8 : 0 }}
                        >
                          <Text className="text-base">{member}</Text>
                        </View>
                      ))}
                      <Text className="text-xs text-gray-600 font-medium ml-2">{cell.memberCount}+</Text>
                    </View>
                  </View>

                  <TouchableOpacity className="w-10 h-10 rounded-full bg-white/30 justify-center items-center border border-white/20 border-dashed">
                    <Ionicons name="chevron-forward" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center py-24">
          <Ionicons name="people-outline" size={80} color="#666" />
          <Text className="text-2xl font-semibold text-gray-800 mt-5 mb-2">Not in a cell</Text>
          <Text className="text-base text-gray-500 text-center px-10 leading-6">
            Join a cell to connect with others and start your journey together
          </Text>
        </View>
      )}
    </View>
  )

  const renderFlows = () => (
    <View className="px-5 py-6">
      <View className="flex-1 justify-center items-center py-24">
        <Ionicons name="git-branch-outline" size={80} color="#666" />
        <Text className="text-2xl font-semibold text-gray-800 mt-5 mb-2">Flows Coming Soon</Text>
        <Text className="text-base text-gray-500 text-center px-10 leading-6">
          This section is being developed and will be available soon
        </Text>
      </View>
    </View>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "Personal Information":
        return renderPersonalInformation()
      case "Cell Groups":
        return renderCellGroups()
      case "Flows":
        return renderFlows()
      default:
        return renderPersonalInformation()
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FCFCFC]">
      <StatusBar barStyle="dark-content" />

      {/* Header with gradient background */}
      <View className="bg-gradient-to-br from-pink-200 via-orange-200 to-yellow-200 pt-12 pb-8">
        <View className="flex-row items-center justify-between px-5 mb-6">
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View className="items-center px-5">
          <Image source={{ uri: profileData.avatar }} className="w-24 h-24 rounded-full mb-4 border-4 border-white" />
          <Text className="text-2xl font-bold text-gray-800 mb-1">{profileData.name}</Text>
          <Text className="text-base text-gray-600 mb-6">{profileData.username}</Text>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity className="bg-white/80 px-6 py-3 rounded-xl">
              <Text className="text-gray-800 font-medium">Send message</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#699EFF] px-6 py-3 rounded-xl">
              <Text className="text-white font-medium">Add to project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5">
          <View className="flex-row py-4">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-4 py-2 mr-4 rounded-full ${activeTab === tab ? "bg-[#699EFF]" : "bg-gray-100"}`}
              >
                <Text className={`font-medium ${activeTab === tab ? "text-white" : "text-gray-600"}`}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen
