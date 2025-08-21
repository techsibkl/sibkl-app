import AnnouncementCard from "@/components/Home/AnnouncementCard";
import Greeting from "@/components/Home/Greeting";
import Header from "@/components/Home/Header";
import Notification from "@/components/Home/Notification";
import NotificationList from "@/components/Home/NotificationList";
import { useThemeColors } from "@/hooks/useThemeColor";
import { useAuthStore } from "@/stores/authStore";
import { ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DashboardScreen = () => {
  const { isDark } = useThemeColors();
  const notifications = [
    {
      id: 1,
      people_id: 101,
      name: "Sarah Chen",
      title: "Flow Update",
      body: "Your workflow has been updated successfully",
      type: "flow" as const,
      ref_id: 2301,
      read_at: null,
      closed_at: null,
      created_at: "2024-08-14T10:28:00Z",
      timeAgo: "2 min ago",
    },
    {
      id: 2,
      people_id: 102,
      name: "Marcus Johnson",
      title: "New Team Member",
      body: "A new member has joined your team",
      type: "people" as const,
      ref_id: 1205,
      read_at: null,
      closed_at: null,
      created_at: "2024-08-14T10:25:00Z",
      timeAgo: "5 min ago",
    },
    {
      id: 3,
      people_id: 103,
      name: "Elena Rodriguez",
      title: "Cell Assignment",
      body: "You have been assigned to a new cell",
      type: "cell" as const,
      ref_id: 3401,
      read_at: null,
      closed_at: null,
      created_at: "2024-08-14T10:23:00Z",
      timeAgo: "7 min ago",
    },
    {
      id: 4,
      people_id: 104,
      name: "David Kim",
      title: "Duplicate Found",
      body: "Potential duplicate entry detected in your data",
      type: "duplicate" as const,
      ref_id: 5601,
      read_at: null,
      closed_at: null,
      created_at: "2024-08-14T10:18:00Z",
      timeAgo: "12 min ago",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <StatusBar
        className="bg-background dark:bg-background-dark"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      {/* Header */}
      <Header />

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Greeting />

        {/* Featured Card */}
        <AnnouncementCard />

        {/* Notification Section */}
        <Notification />
        <NotificationList notifications={notifications} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
