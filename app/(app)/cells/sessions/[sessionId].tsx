import { useCellSessionByIdQuery } from "@/hooks/CellAttendance/useCellAttendanceQuery";
import { CellSessionAttendee } from "@/services/CellAttendance/cellAttendance.type";
import { FlashList } from "@shopify/flash-list";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

const AttendeeRow = ({ attendee }: { attendee: CellSessionAttendee }) => {
  const initial = attendee.guest_name
    ? attendee.guest_name[0].toUpperCase()
    : "M";
  const name = attendee.guest_name ?? `Member #${attendee.people_id}`;
  const time = new Date(attendee.checked_in_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View className="flex-row items-center gap-3 py-3 border-b border-gray-50">
      <View className="w-10 h-10 rounded-full bg-red-50 border-2 border-red-600 items-center justify-center">
        <Text className="text-red-600 font-bold text-base">{initial}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-800">{name}</Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          Checked in at {time}
        </Text>
      </View>
      <View className="w-7 h-7 rounded-full bg-green-50 border-2 border-green-500 items-center justify-center">
        <Text className="text-green-500 font-bold text-sm">✓</Text>
      </View>
    </View>
  );
};

export default function SessionDetailScreen() {
  const { cellId, sessionId } = useLocalSearchParams<{
    cellId: string;
    sessionId: string;
  }>();
  const qrRef = useRef<any>(null);
  const [sharing, setSharing] = useState(false);

  const {
    data: session,
    isLoading,
    isError,
  } = useCellSessionByIdQuery(Number(cellId), Number(sessionId));

  const handleShareQR = async () => {
    if (!qrRef.current) return;
    setSharing(true);
    try {
      qrRef.current.toDataURL(async (dataUrl: string) => {
        const path = `${FileSystem.cacheDirectory}session-${sessionId}-qr.png`;
        await FileSystem.writeAsStringAsync(path, dataUrl, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Sharing.shareAsync(path, {
          mimeType: "image/png",
          dialogTitle: "Share Session QR Code",
        });
        setSharing(false);
      });
    } catch (err) {
      console.error("Share error:", err);
      setSharing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#d6361e" size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !session) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-600 text-base">Failed to load session.</Text>
      </SafeAreaView>
    );
  }

  const date = new Date(session.meeting_date);
  const isUpcoming = date >= new Date(new Date().setHours(0, 0, 0, 0));
  const attendanceRate =
    session.total_members > 0
      ? Math.round((session.attendee_count / session.total_members) * 100)
      : 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6">
          <View className="w-9 h-1 bg-red-600 rounded-full mb-3" />
          <Text className="text-2xl font-bold text-gray-900 tracking-tight leading-8">
            {date.toLocaleDateString("default", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          <Text className="text-sm text-gray-400 mt-1">
            {isUpcoming
              ? "Upcoming session"
              : `${attendanceRate}% attendance rate`}
          </Text>
        </View>

        {/* Stats */}
        {!isUpcoming && (
          <View className="flex-row bg-gray-50 rounded-2xl p-4 mb-7 border border-gray-100">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {session.attendee_count}
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5 font-medium">
                Attended
              </Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {session.total_members}
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5 font-medium">
                Members
              </Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-red-600">
                {attendanceRate}%
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5 font-medium">
                Rate
              </Text>
            </View>
          </View>
        )}

        {/* QR Section */}
        <View className="mb-8">
          <Text className="text-xs font-bold text-gray-400 tracking-widest mb-1">
            SESSION QR CODE
          </Text>
          <Text className="text-sm text-gray-300 mb-5">
            {isUpcoming
              ? "Members scan this to mark attendance"
              : "Session has passed — QR no longer active"}
          </Text>

          <View className="items-center">
            <View
              className={`p-6 bg-white rounded-3xl mb-5 ${!isUpcoming ? "opacity-40" : ""}`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 5,
              }}
            >
              <QRCode
                value={String(session.id)}
                size={200}
                getRef={(ref) => (qrRef.current = ref)}
                color={isUpcoming ? "#111111" : "#cccccc"}
              />
              {!isUpcoming && (
                <View className="absolute inset-0 items-center justify-center rounded-3xl">
                  <View className="bg-white/90 px-3 py-1 rounded-lg">
                    <Text className="text-gray-400 font-black tracking-widest text-sm">
                      EXPIRED
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Action buttons */}
            <View className="flex-row gap-3 w-full">
              <Pressable
                className={`flex-1 bg-red-600 rounded-xl py-3.5 items-center ${
                  !isUpcoming || sharing ? "opacity-40" : ""
                }`}
                onPress={handleShareQR}
                disabled={sharing || !isUpcoming}
              >
                {sharing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Share QR
                  </Text>
                )}
              </Pressable>

              <Pressable
                className="flex-1 border-2 border-red-600 rounded-xl py-3.5 items-center"
                onPress={handleShareQR}
                disabled={sharing}
              >
                <Text className="text-red-600 font-bold text-base">
                  Download PNG
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Attendees */}
        {!isUpcoming && (
          <View>
            <Text className="text-xs font-bold text-gray-400 tracking-widest mb-3">
              ATTENDEES ({session.attendees?.length ?? 0})
            </Text>
            {session.attendees?.length > 0 ? (
              <FlashList
                data={session.attendees}
                keyExtractor={(item) => String(item.id)}
                estimatedItemSize={60}
                scrollEnabled={false}
                renderItem={({ item }) => <AttendeeRow attendee={item} />}
              />
            ) : (
              <Text className="text-gray-400 text-sm text-center py-6">
                No attendees recorded.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
