"use client"

import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, StatusBar } from "react-native"
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

const CellsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("")

  // Sample data - replace with actual user's cells
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
    {
      id: "3",
      name: "Talent Tribe",
      subtitle: "Live start soon",
      memberCount: 432,
      backgroundColor: "#D4C5F9",
      iconColor: "#7B6BA8",
      members: ["👤", "👤", "👤", "👤"],
    },
    {
      id: "4",
      name: "Glamour Guild",
      subtitle: "Live start soon",
      memberCount: 432,
      backgroundColor: "#B3D9FF",
      iconColor: "#5A7BA8",
      members: ["👤", "👤", "👤", "👤"],
    },
  ]

  const filteredCells = userCells.filter((cell) => cell.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-24">
      <Ionicons name="people-outline" size={80} color="#666" />
      <Text className="text-2xl font-semibold text-white mt-5 mb-2">Not in a cell</Text>
      <Text className="text-base text-gray-400 text-center px-10 leading-6">
        Join a cell to connect with others and start your journey together
      </Text>
    </View>
  )

  const renderCellCard = (cell: Cell) => (
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
  )

  return (
    <SafeAreaView className="flex-1 bg-[#1a1a2e]">
      <StatusBar barStyle="light-content" />

      {/* Header with Search */}
      <View className="pt-15 px-5 pb-5 bg-gradient-to-br from-indigo-500 to-purple-600">
        <Text className="text-3xl font-bold text-white mb-5">Cells</Text>
        <View className="flex-row items-center bg-white/20 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#999" className="mr-2" />
          <TextInput
            className="flex-1 text-white text-base"
            placeholder="Search cells..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
        {filteredCells.length > 0 ? <View>{filteredCells.map(renderCellCard)}</View> : renderEmptyState()}
      </ScrollView>
    </SafeAreaView>
  )
}

export default CellsScreen
