import AnalyticsSummaryStats from "@/components/Cells/Analytics/AnalyticsSummaryStats";
import AttendanceTrendChart from "@/components/Cells/Analytics/AttendanceTrendChart";
import MemberAttendanceCard from "@/components/Cells/Analytics/MemberAttendanceCard";
import {
  CellAttendanceStat,
  CellSession,
} from "@/services/CellAttendance/cellAttendance.type";
import { Person } from "@/services/Person/person.type";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

type Props = {
  stats: CellAttendanceStat[];
  sessions: CellSession[];
  members?: Person[];
};

const average = (values: number[]) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const toPercent = (rate: number) => {
  if (!Number.isFinite(rate)) return 0;
  return Math.round(rate <= 1 ? rate * 100 : rate);
};

const getMemberRate = (session: CellSession) => {
  if (!session.total_members) return 0;
  return Number(session.member_count ?? 0) / session.total_members;
};

export default function AnalyticsPanel({
  stats,
  sessions,
  members = [],
}: Props) {
  const averageMemberOverallPercent = useMemo(
    () => toPercent(average(stats.map((stat) => Number(stat.attendance_rate ?? 0)))),
    [stats],
  );

  const averageMemberPerSessionPercent = useMemo(() => {
    const attendedSessions = sessions.filter(
      (session) => Number(session.member_count ?? 0) > 0,
    );
    return toPercent(average(attendedSessions.map(getMemberRate)));
  }, [sessions]);

  const totalGuests = useMemo(
    () =>
      sessions.reduce(
        (sum, session) => sum + Number(session.guest_count ?? 0),
        0,
      ),
    [sessions],
  );

  const memberCoreById = useMemo(() => {
    const map = new Map<number, boolean>();
    for (const member of members) {
      map.set(member.id, Boolean(member.is_core));
    }
    return map;
  }, [members]);

  return (
    <View className="gap-5">
      <AnalyticsSummaryStats
        averageMemberOverallPercent={averageMemberOverallPercent}
        averageMemberPerSessionPercent={averageMemberPerSessionPercent}
        totalGuests={totalGuests}
        totalSessions={sessions.length}
      />

      <AttendanceTrendChart sessions={sessions} />

      <View>
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-semibold text-gray-900">Members</Text>
          <Text className="text-xs text-gray-400">{stats.length}</Text>
        </View>
        <View className="h-px bg-gray-100 mb-3" />

        {stats.length === 0 ? (
          <View className="items-center py-8">
            <Text className="text-sm text-gray-400">
              No member attendance data yet
            </Text>
          </View>
        ) : (
          stats.map((stat) => (
            <MemberAttendanceCard
              key={stat.people_id}
              stat={stat}
              isCore={memberCoreById.get(stat.people_id) ?? false}
            />
          ))
        )}
      </View>
    </View>
  );
}
