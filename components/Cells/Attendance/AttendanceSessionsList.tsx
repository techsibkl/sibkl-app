import React, { useState } from "react";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AttendanceSessionCard from "./AttendanceSessionCard";
import { CellSession } from "@/services/CellAttendance/cellAttendance.type";

type Props = {
  sessions: CellSession[];
  myAttendanceMap: Record<number, boolean>;
  isLoading?: boolean;
};

type SortBy = "newest" | "oldest" | "attendance";

export default function AttendanceSessionsList({
  sessions,
  myAttendanceMap,
  isLoading = false,
}: Props) {
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  const sortedSessions = React.useMemo(() => {
    const copy = [...sessions];
    switch (sortBy) {
      case "newest":
        return copy.sort(
          (a, b) =>
            new Date(b.meeting_date).getTime() -
            new Date(a.meeting_date).getTime()
        );
      case "oldest":
        return copy.sort(
          (a, b) =>
            new Date(a.meeting_date).getTime() -
            new Date(b.meeting_date).getTime()
        );
      case "attendance":
        return copy.sort((a, b) => {
          const aAttended = myAttendanceMap[a.id] ? 1 : 0;
          const bAttended = myAttendanceMap[b.id] ? 1 : 0;
          return bAttended - aAttended;
        });
      default:
        return copy;
    }
  }, [sessions, sortBy, myAttendanceMap]);

  if (isLoading) {
    return (
      <View className="items-center py-8">
        <Text className="text-gray-500">Loading attendance...</Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View className="items-center py-8">
        <MaterialCommunityIcons name="calendar-blank" size={32} color="#ccc" />
        <Text className="text-gray-400 mt-2">No sessions yet</Text>
      </View>
    );
  }

  return (
    <View>
      {/* Sort buttons */}
      <View className="flex-row gap-2 mb-4 px-0">
        <TouchableOpacity
          onPress={() => setSortBy("newest")}
          className={`flex-1 py-2 px-3 rounded-lg border ${
            sortBy === "newest"
              ? "bg-gray-900 border-gray-900"
              : "bg-white border-gray-200"
          }`}
        >
          <Text
            className={`text-xs font-medium text-center ${
              sortBy === "newest" ? "text-white" : "text-gray-700"
            }`}
          >
            Newest
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSortBy("oldest")}
          className={`flex-1 py-2 px-3 rounded-lg border ${
            sortBy === "oldest"
              ? "bg-gray-900 border-gray-900"
              : "bg-white border-gray-200"
          }`}
        >
          <Text
            className={`text-xs font-medium text-center ${
              sortBy === "oldest" ? "text-white" : "text-gray-700"
            }`}
          >
            Oldest
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSortBy("attendance")}
          className={`flex-1 py-2 px-3 rounded-lg border ${
            sortBy === "attendance"
              ? "bg-gray-900 border-gray-900"
              : "bg-white border-gray-200"
          }`}
        >
          <Text
            className={`text-xs font-medium text-center ${
              sortBy === "attendance" ? "text-white" : "text-gray-700"
            }`}
          >
            Attended
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sessions list */}
      <View>
        {sortedSessions.map((session) => (
          <AttendanceSessionCard
            key={session.id}
            session={session}
            attended={myAttendanceMap[session.id] ?? false}
          />
        ))}
      </View>
    </View>
  );
}
