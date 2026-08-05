import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CellSession } from "@/services/CellAttendance/cellAttendance.type";

type Props = {
  session: CellSession;
  attended: boolean;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
};

export default function AttendanceSessionCard({ session, attended }: Props) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3 rounded-lg mb-2 border ${
        attended
          ? "bg-green-50 border-green-200"
          : "bg-gray-50 border-gray-200 opacity-60"
      }`}
    >
      <View className="flex-1">
        <Text
          className={`text-sm font-medium ${
            attended ? "text-gray-900" : "text-gray-500"
          }`}
          numberOfLines={1}
        >
          Session • {formatDate(session.meeting_date)}
        </Text>
        <Text
          className={`text-xs ${attended ? "text-green-600" : "text-gray-400"}`}
        >
          {session.member_count ?? 0} members • {session.guest_count ?? 0}{" "}
          guest{(session.guest_count ?? 0) === 1 ? "" : "s"}
        </Text>
      </View>

      <View className="ml-3">
        {attended ? (
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color="#10b981"
          />
        ) : (
          <MaterialCommunityIcons name="circle-outline" size={24} color="#ccc" />
        )}
      </View>
    </View>
  );
}
