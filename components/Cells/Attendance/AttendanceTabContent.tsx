import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AnalyticsPanel from "@/components/Cells/Analytics/AnalyticsPanel";
import AttendanceSessionsList from "./AttendanceSessionsList";
import MyAttendanceSummary from "./MyAttendanceSummary";
import { CellSession } from "@/services/CellAttendance/cellAttendance.type";

export type Props = {
  cellId: number;
  sessions: CellSession[];
  isLeader: boolean;
  currentPersonId?: number;
  sessionStats?: any;
  memberStats?: any;
  mySessionAttendance?: Record<number, boolean>;
  members?: any[];
  isLoadingSessions?: boolean;
  isLoadingPersonStats?: boolean;
};

export default function AttendanceTabContent({
  cellId,
  sessions,
  isLeader,
  currentPersonId,
  sessionStats,
  memberStats,
  mySessionAttendance = {},
  members = [],
  isLoadingSessions = false,
  isLoadingPersonStats = false,
}: Props) {
  const [cellAttendanceExpanded, setCellAttendanceExpanded] = useState(isLeader);
  const [myAttendanceExpanded, setMyAttendanceExpanded] = useState(true);

  const myStats = useMemo(() => {
    if (!sessionStats || !Array.isArray(sessionStats) || sessionStats.length === 0) {
      return null;
    }
    return sessionStats[0];
  }, [sessionStats]);

  const SectionHeader = ({
    title,
    expanded,
    onToggle,
    icon,
  }: {
    title: string;
    expanded: boolean;
    onToggle: () => void;
    icon: string;
  }) => (
    <TouchableOpacity
      onPress={onToggle}
      className="flex-row items-center justify-between bg-gray-100 px-4 py-3 rounded-lg mb-3"
    >
      <View className="flex-row items-center gap-2 flex-1">
        <MaterialCommunityIcons name={icon} size={20} color="#374151" />
        <Text className="text-base font-semibold text-gray-900">{title}</Text>
      </View>
      <MaterialCommunityIcons
        name={expanded ? "chevron-up" : "chevron-down"}
        size={24}
        color="#6B7280"
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="px-6 py-4">
      {/* Cell Attendance Section (for leaders only) */}
      {isLeader && memberStats && (
        <View className="mb-6">
          <SectionHeader
            title="Cell Attendance"
            expanded={cellAttendanceExpanded}
            onToggle={() => setCellAttendanceExpanded(!cellAttendanceExpanded)}
            icon="chart-bar"
          />

          {cellAttendanceExpanded && (
            <View className="mb-6">
              <AnalyticsPanel
                stats={memberStats}
                sessions={sessions}
                members={members}
              />
            </View>
          )}
        </View>
      )}

      {/* My Attendance Section */}
      <View className="mb-6">
        <SectionHeader
          title="My Attendance"
          expanded={myAttendanceExpanded}
          onToggle={() => setMyAttendanceExpanded(!myAttendanceExpanded)}
          icon="account-check"
        />

        {myAttendanceExpanded && (
          <View>
            {/* My attendance summary */}
            {myStats && (
              <View className="mb-4">
                <MyAttendanceSummary
                  sessionsAttended={myStats.sessions_attended ?? 0}
                  totalSessions={myStats.total_sessions ?? 0}
                  attendanceRate={myStats.attendance_rate ?? 0}
                />
              </View>
            )}

            {/* My attendance list */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Session History
              </Text>
              <AttendanceSessionsList
                sessions={sessions}
                myAttendanceMap={mySessionAttendance}
                isLoading={isLoadingSessions || isLoadingPersonStats}
              />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
