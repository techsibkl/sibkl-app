import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  sessionsAttended: number;
  totalSessions: number;
  attendanceRate: number;
};

const toAttendancePercent = (rate: number) => {
  if (!Number.isFinite(rate)) return 0;
  return Math.round(rate <= 1 ? rate * 100 : rate);
};

export default function MyAttendanceSummary({
  sessionsAttended,
  totalSessions,
  attendanceRate,
}: Props) {
  const attendancePercent = toAttendancePercent(attendanceRate);

  return (
    <View className="bg-white border border-gray-100 rounded-xl px-4 py-4 mb-4">
      <View className="flex-row items-center gap-2 mb-3">
        <MaterialCommunityIcons name="chart-line" size={20} color="#d6361e" />
        <Text className="text-base font-semibold text-gray-900">
          My Attendance
        </Text>
      </View>

      <View className="flex-row justify-between gap-3">
        <View className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
          <Text className="text-xs text-gray-500 mb-1">Sessions Attended</Text>
          <Text className="text-xl font-bold text-gray-900">
            {sessionsAttended}/{totalSessions}
          </Text>
        </View>

        <View className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
          <Text className="text-xs text-gray-500 mb-1">Attendance Rate</Text>
          <Text className="text-xl font-bold text-gray-900">
            {attendancePercent}%
          </Text>
        </View>
      </View>
    </View>
  );
}
