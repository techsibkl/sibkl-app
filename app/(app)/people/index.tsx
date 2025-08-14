"use client"

import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native"

interface Person {
  id: string
  fullName: string
  phone: string
  avatar: string
}

const PeopleScreen = () => {
  const [searchQuery, setSearchQuery] = useState("")

  // Sample data - replace with actual contacts
  const people: Person[] = [
    {
      id: "1",
      fullName: "Maya Chen",
      phone: "+1 (555) 123-4567",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "2",
      fullName: "Zheng Yong",
      phone: "+1 (555) 234-5678",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "3",
      fullName: "Sarah Johnson",
      phone: "+1 (555) 345-6789",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "4",
      fullName: "Lai Joo Nai",
      phone: "+1 (555) 456-7890",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "5",
      fullName: "Alex Rodriguez",
      phone: "+1 (555) 567-8901",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
  ]

  const filteredPeople = people.filter(
    (person) => person.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || person.phone.includes(searchQuery),
  )

  const handlePersonPress = (person: Person) => {
    // Navigate to profile or handle person selection
    console.log("Opening profile for:", person.fullName)
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="pt-12 px-5 pb-4">
        {/* Top controls */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-row bg-gray-800 rounded-full">
            <TouchableOpacity className="px-4 py-2 bg-gray-600 rounded-full">
              <Text className="text-white font-medium">All</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-4 py-2">
              <Text className="text-gray-400 font-medium">Missed</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-white mb-4">People</Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-800 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            className="flex-1 text-white text-base ml-3"
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* People List */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {filteredPeople.map((person) => (
          <TouchableOpacity
            key={person.id}
            className="flex-row items-center py-3 border-b border-gray-800"
            onPress={() => handlePersonPress(person)}
            activeOpacity={0.7}
          >
            {/* Avatar */}
            <View className="w-12 h-12 rounded-full bg-gray-600 mr-4 overflow-hidden">
              <Image source={{ uri: person.avatar }} className="w-full h-full" resizeMode="cover" />
            </View>

            {/* Person Info */}
            <View className="flex-1">
              <Text className="text-white text-base font-medium mb-1">{person.fullName}</Text>
              <Text className="text-gray-400 text-sm">{person.phone}</Text>
            </View>

            {/* Info Button */}
            <TouchableOpacity className="p-2">
              <Ionicons name="information-circle-outline" size={20} color="#666" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="flex-row justify-around items-center py-4 pb-8 bg-black border-t border-gray-800">
        <TouchableOpacity className="items-center">
          <Ionicons name="refresh" size={24} color="#666" />
          <Text className="text-xs text-gray-400 mt-1">Updates</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="call" size={24} color="white" />
          <Text className="text-xs text-white mt-1">Calls</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="people" size={24} color="#666" />
          <Text className="text-xs text-gray-400 mt-1">Communities</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center relative">
          <Ionicons name="chatbubbles" size={24} color="#666" />
          <View className="absolute -top-1 -right-1 bg-green-500 rounded-full w-5 h-5 justify-center items-center">
            <Text className="text-white text-xs font-bold">36</Text>
          </View>
          <Text className="text-xs text-gray-400 mt-1">Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center relative">
          <Ionicons name="settings" size={24} color="#666" />
          <View className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 justify-center items-center">
            <Text className="text-white text-xs font-bold">1</Text>
          </View>
          <Text className="text-xs text-gray-400 mt-1">Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default PeopleScreen
