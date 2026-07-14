import React from "react";
import { Text, View } from "react-native";

type Props = {
  averageMemberOverallPercent: number;
  averageMemberPerSessionPercent: number;
  totalGuests: number;
  totalSessions: number;
};

const StatCard = ({
  label,
  value,
  hint,
  valueClassName,
}: {
  label: string;
  value: string;
  hint: string;
  valueClassName: string;
}) => (
  <View className="flex-1 min-w-[47%] bg-white border border-gray-200 rounded-xl p-4">
    <Text className="text-sm text-gray-500">{label}</Text>
    <Text className={`text-2xl font-bold mt-1 ${valueClassName}`}>{value}</Text>
    <Text className="text-xs text-gray-400 mt-0.5">{hint}</Text>
  </View>
);

export default function AnalyticsSummaryStats({
  averageMemberOverallPercent,
  averageMemberPerSessionPercent,
  totalGuests,
  totalSessions,
}: Props) {
  return (
    <View className="flex-row flex-wrap gap-3">
      <StatCard
        label="Total Sessions"
        value={String(totalSessions)}
        hint="recorded for this cell"
        valueClassName="text-blue-600"
      />
      <StatCard
        label="Avg Members Overall"
        value={`${averageMemberOverallPercent}%`}
        hint="across all members"
        valueClassName="text-green-600"
      />
      <StatCard
        label="Avg Members / Session"
        value={`${averageMemberPerSessionPercent}%`}
        hint="of total members"
        valueClassName="text-emerald-600"
      />
      <StatCard
        label="Total Guests"
        value={String(totalGuests)}
        hint="joined across sessions"
        valueClassName="text-orange-600"
      />
    </View>
  );
}
