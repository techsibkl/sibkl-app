"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react-native"
import { Linking, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const LeadersPage = () => {
  // const [searchText, setSearchText] = useState("")

  const categories = [
    {
      title: "Discipleship",
      items: [
        { title: "Growing in Faith", type: "pdf", url: "https://example.com/discipleship1.pdf" },
        { title: "Prayer Life", type: "pdf", url: "https://example.com/discipleship2.pdf" },
        { title: "Bible Study Methods", type: "url", url: "https://example.com/bible-study" },
      ],
    },
    {
      title: "Cell Notes",
      items: [
        { title: "Week 1: Community", type: "pdf", url: "https://example.com/cell1.pdf" },
        { title: "Week 2: Fellowship", type: "pdf", url: "https://example.com/cell2.pdf" },
        { title: "Week 3: Growth", type: "pdf", url: "https://example.com/cell3.pdf" },
      ],
    },
    {
      title: "Sermon Notes",
      items: [
        { title: "Justice Series - Part 1", type: "pdf", url: "https://example.com/sermon1.pdf" },
        { title: "Love in Action", type: "pdf", url: "https://example.com/sermon2.pdf" },
        { title: "Faith and Works", type: "url", url: "https://example.com/sermon3" },
      ],
    },
    {
      title: "Volunteer Information",
      items: [
        { title: "Volunteer Handbook", type: "pdf", url: "https://example.com/volunteer-handbook.pdf" },
        { title: "Ministry Opportunities", type: "url", url: "https://example.com/ministries" },
        { title: "Training Schedule", type: "pdf", url: "https://example.com/training.pdf" },
      ],
    },
    {
      title: "Policies",
      items: [
        { title: "Child Protection Policy", type: "pdf", url: "https://example.com/child-protection.pdf" },
        { title: "Code of Conduct", type: "pdf", url: "https://example.com/code-conduct.pdf" },
        { title: "Privacy Policy", type: "url", url: "https://example.com/privacy" },
      ],
    },
    {
      title: "Events",
      items: [
        { title: "Upcoming Conferences", type: "url", url: "https://example.com/conferences" },
        { title: "Community Outreach", type: "pdf", url: "https://example.com/outreach.pdf" },
        { title: "Youth Events", type: "url", url: "https://example.com/youth-events" },
      ],
    },
  ]

  const handleItemPress = async (url: string) => {
    try {
      await Linking.openURL(url)
    } catch (error) {
      console.error("Error opening URL:", error)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4">
            <ChevronLeftIcon size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-medium">Discover</Text>
        </View>
        <Text className="text-white text-lg font-medium">Resources</Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {categories.map((category, categoryIndex) => (
          <View key={categoryIndex} className="mb-8">
            {/* Category Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-xl font-bold">{category.title}</Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-gray-400 text-sm mr-1">See All</Text>
                <ChevronRightIcon size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Category Items */}
            <View className="space-y-3">
              {category.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  className="bg-gray-900 rounded-lg p-4 flex-row items-center justify-between"
                  onPress={() => handleItemPress(item.url)}
                >
                  <View className="flex-1">
                    <Text className="text-white text-base font-medium mb-1">{item.title}</Text>
                    <Text className="text-gray-400 text-sm capitalize">
                      {item.type === "pdf" ? "PDF Document" : "Web Resource"}
                    </Text>
                  </View>
                  <View className="ml-3">
                    <ChevronRightIcon size={20} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>


    </SafeAreaView>
  )
}

export default LeadersPage
