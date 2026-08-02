import { CellAttendanceStat } from "@/services/CellAttendance/cellAttendance.type";
import React from "react";
import { Text, View } from "react-native";

type Props = {
  stat: CellAttendanceStat;
  isCore?: boolean;
};

/** Backend sends 0–1 ratios (e.g. 0.5); show as 0–100. */
const toAttendancePercent = (rate: number) => {
  if (!Number.isFinite(rate)) return 0;
  return Math.round(rate <= 1 ? rate * 100 : rate);
};

export default function MemberAttendanceCard({
  stat,
  isCore = false,
}: Props) {
  const attendancePercent = toAttendancePercent(stat.attendance_rate);

  return (
    <View className="flex-row items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 mb-2">
      <View className="flex-1 pr-3 gap-1">
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text
            className="text-base font-semibold text-gray-900 flex-shrink"
            numberOfLines={1}
          >
            {stat.full_legal_name || "Unknown member"}
          </Text>
          <View
            className={`rounded-full px-2 py-0.5 ${
              isCore ? "bg-red-50" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isCore ? "text-red-600" : "text-gray-500"
              }`}
            >
              {isCore ? "Core" : "Member"}
            </Text>
          </View>
        </View>
        <Text className="text-xs text-gray-400">
          {stat.sessions_attended} / {stat.total_sessions} sessions
        </Text>
      </View>
      <Text className="text-lg font-bold text-gray-900">
        {attendancePercent}%
      </Text>
    </View>
  );
}
