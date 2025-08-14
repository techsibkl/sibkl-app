import {
  ChevronLeft,
  CircleQuestionMark,
  FileText,
  LockKeyhole,
  Mail,
  Moon,
  SquareArrowRight,
} from "lucide-react-native";
import { useState } from "react";
import { View, Text, TouchableOpacity, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const [darkTheme, setDarkTheme] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => console.log("Logged out"),
      },
    ]);
  };

  const settingsOptions = [
    {
      id: "darkTheme",
      icon: <Moon className="w-6 h-6 text-gray-400" />,
      title: "Dark Theme Toggle",
      subtitle: "Switch between dark and light mode",
      hasToggle: true,
      toggleValue: darkTheme,
      onToggle: setDarkTheme,
    },
    {
      id: "changeEmail",
      icon: <Mail className="w-6 h-6 text-gray-400" />,
      title: "Change email",
      subtitle: "Update your email address",
      onPress: () => console.log("Change email pressed"),
    },
    {
      id: "changePassword",
      icon: <LockKeyhole className="w-6 h-6 text-gray-400" />,
      title: "Change password",
      subtitle: "••••••••",
      onPress: () => console.log("Change password pressed"),
    },
    {
      id: "privacyPolicy",
      icon: <FileText className="w-6 h-6 text-gray-400" />,
      title: "Privacy Policy",
      subtitle: "View our privacy policy",
      onPress: () => console.log("Privacy Policy pressed"),
    },
    {
      id: "faqs",
      icon: <CircleQuestionMark className="w-6 h-6 text-gray-400" />,
      title: "FAQs",
      subtitle: "Frequently asked questions",
      onPress: () => console.log("FAQs pressed"),
    },
    {
      id: "logout",
      icon: <SquareArrowRight className="w-6 h-6 text-red-500" />,
      title: "Logout",
      subtitle: "Sign out of your account",
      isDestructive: true,
      onPress: handleLogout,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-gray-900">
        {/* Status Bar Spacer */}
        <View className="h-12" />

        {/* Header */}
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity className="mr-4">
            <ChevronLeft className="w-6 h-6 text-white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">Settings</Text>
        </View>

        {/* Settings Options */}
        <View className="flex-1 px-4 pt-6">
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              className="flex-row items-center py-4 border-b border-gray-800"
              onPress={option.onPress}
              disabled={option.hasToggle}
            >
              {/* Icon */}
              <View className="w-10 h-10 items-center justify-center mr-4">
                {option.icon}
              </View>

              {/* Content */}
              <View className="flex-1">
                <Text
                  className={`text-lg font-medium ${option.isDestructive ? "text-red-500" : "text-white"}`}
                >
                  {option.title}
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  {option.subtitle}
                </Text>
              </View>

              {/* Right Side */}
              {option.hasToggle ? (
                <Switch
                  value={option.toggleValue}
                  onValueChange={option.onToggle}
                  trackColor={{ false: "#374151", true: "#10B981" }}
                  thumbColor={option.toggleValue ? "#ffffff" : "#9CA3AF"}
                />
              ) : (
                <View className="w-6 h-6 items-center justify-center">
                  <Text className="text-gray-400 text-lg">›</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
