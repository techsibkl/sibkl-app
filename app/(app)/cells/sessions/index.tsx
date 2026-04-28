import SharedBody from "@/components/shared/SharedBody";
import { useCellSessionsQuery } from "@/hooks/CellAttendance/useCellAttendanceQuery";
import { CellSession } from "@/services/CellAttendance/cellAttendance.type";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TODAY = new Date(new Date().setHours(0, 0, 0, 0));

const isUpcomingOrLive = (session: CellSession) =>
  new Date(session.meeting_date) >= TODAY;

type SectionItem =
  | { type: "header"; label: string }
  | { type: "session"; data: CellSession };

const SessionCard = ({
  session,
  onPress,
}: {
  session: CellSession;
  onPress: () => void;
}) => {
  const date = new Date(session.meeting_date);
  const isToday = date.toDateString() === new Date().toDateString();
  const isUpcoming = isUpcomingOrLive(session);
  const attendanceRate =
    session.total_members > 0
      ? Math.round((session.attendee_count / session.total_members) * 100)
      : 0;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl p-4 border border-gray-100 gap-3 mb-2"
      style={{ elevation: 2 }}
    >
      {/* Date badge */}
      <View
        className={`w-12 h-14 rounded-xl items-center justify-center ${
          isToday
            ? "bg-red-600"
            : isUpcoming
              ? "bg-red-50 border-2 border-red-600"
              : "bg-gray-100"
        }`}
      >
        <Text
          className={`text-xl font-bold ${
            isToday
              ? "text-white"
              : isUpcoming
                ? "text-red-600"
                : "text-gray-500"
          }`}
        >
          {date.getDate()}
        </Text>
        <Text
          className={`text-xs font-semibold tracking-widest ${
            isToday
              ? "text-white"
              : isUpcoming
                ? "text-red-600"
                : "text-gray-400"
          }`}
        >
          {date.toLocaleString("default", { month: "short" }).toUpperCase()}
        </Text>
      </View>

      {/* Body */}
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text className="text-base font-bold text-gray-900">
            {isToday
              ? "Today's Session"
              : isUpcoming
                ? "Upcoming Session"
                : "Past Session"}
          </Text>
          {isToday && (
            <View className="bg-red-600 rounded px-1.5 py-0.5">
              <Text className="text-white text-xs font-bold tracking-wide">
                LIVE
              </Text>
            </View>
          )}
          {isUpcoming && !isToday && (
            <View className="bg-red-50 border border-red-600 rounded px-1.5 py-0.5">
              <Text className="text-red-600 text-xs font-bold tracking-wide">
                UPCOMING
              </Text>
            </View>
          )}
        </View>

        <Text className="text-xs text-gray-400">
          {date.toLocaleDateString("default", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>

        {/* Attendance bar for past sessions */}
        {!isUpcoming && (
          <View className="flex-row items-center gap-2 mt-1">
            <View className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-red-600 rounded-full"
                style={{ width: `${attendanceRate}%` }}
              />
            </View>
            <Text className="text-xs text-gray-400">
              {session.attendee_count}/{session.total_members}
            </Text>
          </View>
        )}

        {/* Attendee count for upcoming */}
        {isToday && session.attendee_count > 0 && (
          <Text className="text-xs text-red-600 font-semibold mt-0.5">
            {session.attendee_count} checked in so far
          </Text>
        )}
      </View>

      <Text className="text-2xl text-gray-300 font-light">›</Text>
    </Pressable>
  );
};

const SectionHeader = ({ label }: { label: string }) => (
  <View className="pt-5 pb-2">
    <Text className="text-xs font-bold text-gray-400 tracking-widest">
      {label}
    </Text>
  </View>
);

export default function SessionsScreen() {
  const { cell_id } = useLocalSearchParams<{ cell_id: string }>();
  const cellId = Number(cell_id);
  const router = useRouter();

  const {
    data: sessions,
    isLoading,
    isError,
    refetch,
  } = useCellSessionsQuery(cellId);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#d6361e" size="large" />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-600 text-base">Failed to load sessions.</Text>
      </SafeAreaView>
    );
  }

  const upcoming = (sessions ?? [])
    .filter(isUpcomingOrLive)
    .sort(
      (a, b) =>
        new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime(),
    );

  const past = (sessions ?? [])
    .filter((s) => !isUpcomingOrLive(s))
    .sort(
      (a, b) =>
        new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime(),
    );

  // Build flat list with section headers interspersed
  const listData: SectionItem[] = [
    ...(upcoming.length > 0
      ? [
          { type: "header" as const, label: "UPCOMING & LIVE" },
          ...upcoming.map((s) => ({ type: "session" as const, data: s })),
        ]
      : []),
    ...(past.length > 0
      ? [
          { type: "header" as const, label: "PAST SESSIONS" },
          ...past.map((s) => ({ type: "session" as const, data: s })),
        ]
      : []),
  ];

  return (
    <SharedBody>
      <FlashList
        data={listData}
        estimatedItemSize={90}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        keyExtractor={(item, index) =>
          item.type === "header" ? `header-${index}` : String(item.data.id)
        }
        getItemType={(item) => item.type}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={
          <View className="mb-2">
            <View className="w-9 h-1 bg-red-600 rounded-full mb-3" />
            <Text className="text-3xl font-bold text-gray-900 tracking-tight">
              Sessions
            </Text>
            <Text className="text-sm text-gray-400 mt-1">
              {upcoming.length} upcoming · {past.length} past
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center pt-16 gap-2">
            <Text className="text-gray-400 text-base">No sessions yet.</Text>
            <Text className="text-gray-300 text-sm">
              Create one using the + button on the cells screen.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          if (item.type === "header") {
            return <SectionHeader label={item.label} />;
          }
          return (
            <SessionCard
              session={item.data}
              onPress={() =>
                router.push({
                  pathname: "/(app)/cells/sessions/[sessionId]",
                  params: {
                    sessionId: item.data.id,
                    cellId: cellId,
                  },
                })
              }
            />
          );
        }}
      />
    </SharedBody>
  );
}
