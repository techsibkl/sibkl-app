"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from "react-native"

interface Member {
  id: string
  name: string
  avatar: string
  role: string
  subtitle: string
}

const CellProfileScreen = () => {
  const [activeTab, setActiveTab] = useState<"people" | "announcements" | "attendance">("people")
  const [searchQuery, setSearchQuery] = useState("")

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
  ]

  const filteredMembers = members.filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const renderTabContent = () => {
    switch (activeTab) {
      case "people":
        return (
          <View className="flex-1">
            {/* Members count and search */}
            <View className="flex-row items-center justify-between px-6 py-4">
              <Text className="text-white text-lg font-semibold">{filteredMembers.length} members</Text>
              <TouchableOpacity>
                <Text className="text-gray-400 text-2xl">🔍</Text>
              </TouchableOpacity>
            </View>

            {/* Search input */}
            <View className="px-6 mb-4">
              <TextInput
                className="bg-gray-800 text-white px-4 py-3 rounded-lg"
                placeholder="Search members..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Members list */}
            <ScrollView className="flex-1 px-6">
              {filteredMembers.map((member) => (
                <TouchableOpacity key={member.id} className="flex-row items-center py-3 border-b border-gray-800">
                  <Image source={{ uri: member.avatar }} className="w-12 h-12 rounded-full mr-4" />
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-base">{member.name}</Text>
                    <Text className="text-gray-400 text-sm mt-1">{member.subtitle}</Text>
                  </View>
                  <Text className="text-gray-500 text-sm">{member.role}</Text>
                  <Text className="text-gray-500 ml-2">›</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )
      case "announcements":
        return (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-gray-400 text-center">No announcements yet</Text>
          </View>
        )
      case "attendance":
        return (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-gray-400 text-center">Attendance tracking coming soon</Text>
          </View>
        )
      default:
        return null
    }
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Status bar */}
      <View className="h-12 bg-gray-900" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity>
          <Text className="text-white text-2xl">‹</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Cell info</Text>
        <View className="w-6" />
      </View>

      {/* Cell info section */}
      <View className="items-center py-8">
        {/* Cell logo */}
        <View className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center mb-6">
          <Text className="text-white text-2xl font-bold">tc</Text>
        </View>

        {/* Cell name and details */}
        <Text className="text-white text-2xl font-bold text-center mb-2">SIBKL Campus{"\n"}Serving Teams</Text>
        <Text className="text-gray-400 text-base">Cell • 5 members</Text>
      </View>

      {/* Action buttons */}
      <View className="flex-row justify-around px-6 py-6">
        <TouchableOpacity className="items-center">
          <View className="w-12 h-12 bg-gray-800 rounded-full items-center justify-center mb-2">
            <Text className="text-green-500 text-xl">+</Text>
          </View>
          <Text className="text-white text-sm">Add Member</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <View className="w-12 h-12 bg-gray-800 rounded-full items-center justify-center mb-2">
            <Text className="text-green-500 text-xl">ℹ</Text>
          </View>
          <Text className="text-white text-sm">Cell Details</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <View className="w-12 h-12 bg-gray-800 rounded-full items-center justify-center mb-2">
            <Text className="text-green-500 text-xl">🔍</Text>
          </View>
          <Text className="text-white text-sm">Search</Text>
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View className="flex-row mx-6 mb-6">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-l-lg ${activeTab === "people" ? "bg-gray-700" : "bg-gray-800"}`}
          onPress={() => setActiveTab("people")}
        >
          <Text className={`text-center font-medium ${activeTab === "people" ? "text-white" : "text-gray-400"}`}>
            People
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "announcements" ? "bg-gray-700" : "bg-gray-800"}`}
          onPress={() => setActiveTab("announcements")}
        >
          <Text className={`text-center font-medium ${activeTab === "announcements" ? "text-white" : "text-gray-400"}`}>
            Announcements
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 rounded-r-lg ${activeTab === "attendance" ? "bg-gray-700" : "bg-gray-800"}`}
          onPress={() => setActiveTab("attendance")}
        >
          <Text className={`text-center font-medium ${activeTab === "attendance" ? "text-white" : "text-gray-400"}`}>
            Attendance
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab content */}
      {renderTabContent()}
    </View>
  )
}

export default CellProfileScreen
