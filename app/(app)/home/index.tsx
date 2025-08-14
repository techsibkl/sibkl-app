import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native"

const DashboardScreen = () => {
  const progressItems = [
    {
      id: 1,
      title: "Create Detail Booking",
      category: "Productivity Mobile App",
      timeAgo: "2 min ago",
      progress: 60,
    },
    {
      id: 2,
      title: "Revision Home Page",
      category: "Banking Mobile App",
      timeAgo: "5 min ago",
      progress: 70,
    },
    {
      id: 3,
      title: "Working on Landing Page",
      category: "Online Course",
      timeAgo: "7 min ago",
      progress: 80,
    },
    {
      id: 4,
      title: "Working on Mobile App Design",
      category: "Online Course",
      timeAgo: "12 min ago",
      progress: 40,
    },
  ]

  const CircularProgress = ({ progress }: { progress: number }) => (
    <View className="relative w-12 h-12 justify-center items-center">
      <View className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden">
        <View
          className="absolute w-10 h-10 rounded-full bg-[#699EFF]"
          style={{
            transform: [{ rotate: `${(progress / 100) * 360}deg` }],
          }}
        />
      </View>
      <Text className="absolute text-xs font-bold text-gray-800">{progress}%</Text>
    </View>
  )

  return (
    <View className="flex-1 bg-[#FCFCFC]">
      <StatusBar barStyle="dark-content" backgroundColor="#FCFCFC" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-15 pb-5">
        <TouchableOpacity className="w-8 h-8 rounded-full bg-gray-300 justify-center items-center">
          <View className="w-5 h-5 rounded-full bg-gray-600" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">Friday, 20</Text>
        <TouchableOpacity className="w-8 h-8 justify-center items-center">
          <Text className="text-xl">⏰</Text>
        </TouchableOpacity>
      </View>

      {/* Decorative dots */}
      <View className="absolute top-0 right-0 left-0 bottom-0 -z-10">
        <View className="absolute w-3 h-3 rounded-full bg-yellow-400 opacity-60 top-20 right-12" />
        <View className="absolute w-3 h-3 rounded-full bg-red-400 opacity-60 top-24 right-20" />
        <View className="absolute w-3 h-3 rounded-full bg-teal-400 opacity-60 top-28 right-8" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-1">Hi, Arshmeet!</Text>
          <Text className="text-lg text-gray-600">Lets make habits together 🙏</Text>
        </View>

        {/* Featured Card */}
        <View className="bg-[#699EFF] rounded-2xl p-5 mb-8">
          <Text className="text-xl font-bold text-white mb-1">Application Design</Text>
          <Text className="text-sm text-white opacity-80 mb-5">UI Design Kit</Text>

          <View className="flex-row justify-between items-center">
            <View className="flex-row">
              <View className="w-8 h-8 rounded-full bg-pink-300 border-2 border-white" />
              <View className="w-8 h-8 rounded-full bg-sky-300 border-2 border-white -ml-2" />
              <View className="w-8 h-8 rounded-full bg-purple-300 border-2 border-white -ml-2" />
            </View>
            <View className="items-end">
              <Text className="text-xs text-white opacity-80">Progress</Text>
              <Text className="text-base font-bold text-white">50/80</Text>
            </View>
          </View>
        </View>

        {/* In Progress Section */}
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-xl font-bold text-gray-800">In Progress</Text>
          <TouchableOpacity>
            <Text className="text-2xl text-gray-400">›</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Items */}
        {progressItems.map((item) => (
          <View key={item.id} className="flex-row justify-between items-center py-4 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-xs text-gray-400 mb-0.5">{item.category}</Text>
              <Text className="text-xs text-gray-400 mb-1">{item.timeAgo}</Text>
              <Text className="text-base font-semibold text-gray-800">{item.title}</Text>
            </View>
            <CircularProgress progress={item.progress} />
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="flex-row justify-around items-center py-4 pb-8 bg-white border-t border-gray-100">
        <TouchableOpacity className="p-2">
          <Text className="text-xl text-[#699EFF]">🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity className="p-2">
          <Text className="text-xl text-gray-400">📁</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-[#699EFF] w-12 h-12 rounded-full justify-center items-center">
          <Text className="text-2xl text-white font-bold">+</Text>
        </TouchableOpacity>
        <TouchableOpacity className="p-2">
          <Text className="text-xl text-gray-400">⏱️</Text>
        </TouchableOpacity>
        <TouchableOpacity className="p-2">
          <Text className="text-xl text-gray-400">👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default DashboardScreen
