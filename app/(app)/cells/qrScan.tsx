import { useSignInToCellSessionMutation } from "@/hooks/CellAttendance/useCellAttendanceQuery";
import { useAuthStore } from "@/stores/authStore";
import { CameraView } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScanState = "idle" | "loading" | "success" | "error";

const WINDOW_SIZE = 260;
const CORNER_SIZE = 28;
const CORNER_THICKNESS = 3;
const RED = "#d6361e";

export default function QrScan() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [message, setMessage] = useState("");
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  const personId = useAuthStore((state) => state.user?.person?.id);
  const { cell_id } = useLocalSearchParams<{ cell_id: string }>();
  const { mutateAsync: signIn } = useSignInToCellSessionMutation(
    Number(cell_id ?? 0),
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setScreenSize({ width, height });
  };

  const handleScan = useCallback(
    async ({ data }: { data: string }) => {
      if (scanState !== "idle" || !personId) return;
      setScanState("loading");
      try {
        await signIn({ attendanceId: data, peopleId: personId });
        setMessage("Attendance recorded successfully!");
        setScanState("success");
      } catch (err: any) {
        setMessage(
          err?.message ?? "Failed to submit attendance. Please try again.",
        );
        setScanState("error");
      }
    },
    [scanState, personId, signIn],
  );

  const handleReset = () => {
    setScanState("idle");
    setMessage("");
  };

  // Calculate exact pixel positions for corners
  const windowLeft =
    screenSize.width > 0 ? (screenSize.width - WINDOW_SIZE) / 2 : 0;
  const windowTop =
    screenSize.height > 0 ? (screenSize.height - WINDOW_SIZE) / 2 : 0;

  return (
    <View className="flex-1 bg-black" onLayout={handleLayout}>
      {Platform.OS === "android" && <StatusBar hidden />}

      {/* Full screen camera */}
      <CameraView
        className="absolute inset-0"
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: "qr" }}
        onBarcodeScanned={scanState === "idle" ? handleScan : undefined}
      />

      {/* Dark overlay cutout — 4 regions around the scan window */}
      {screenSize.width > 0 && (
        <View className="absolute inset-0" pointerEvents="none">
          {/* Top */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: windowTop,
              backgroundColor: "rgba(0,0,0,0.65)",
            }}
          />
          {/* Bottom */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              top: windowTop + WINDOW_SIZE,
              backgroundColor: "rgba(0,0,0,0.65)",
            }}
          />
          {/* Left */}
          <View
            style={{
              position: "absolute",
              top: windowTop,
              left: 0,
              width: windowLeft,
              height: WINDOW_SIZE,
              backgroundColor: "rgba(0,0,0,0.65)",
            }}
          />
          {/* Right */}
          <View
            style={{
              position: "absolute",
              top: windowTop,
              right: 0,
              width: windowLeft,
              height: WINDOW_SIZE,
              backgroundColor: "rgba(0,0,0,0.65)",
            }}
          />
        </View>
      )}

      {/* Corner brackets — pixel perfect */}
      {screenSize.width > 0 && (
        <View className="absolute inset-0" pointerEvents="none">
          {/* Top Left */}
          <View
            style={{
              position: "absolute",
              top: windowTop,
              left: windowLeft,
              width: CORNER_SIZE,
              height: CORNER_SIZE,
              borderTopWidth: CORNER_THICKNESS,
              borderLeftWidth: CORNER_THICKNESS,
              borderColor: RED,
              borderTopLeftRadius: 4,
            }}
          />
          {/* Top Right */}
          <View
            style={{
              position: "absolute",
              top: windowTop,
              left: windowLeft + WINDOW_SIZE - CORNER_SIZE,
              width: CORNER_SIZE,
              height: CORNER_SIZE,
              borderTopWidth: CORNER_THICKNESS,
              borderRightWidth: CORNER_THICKNESS,
              borderColor: RED,
              borderTopRightRadius: 4,
            }}
          />
          {/* Bottom Left */}
          <View
            style={{
              position: "absolute",
              top: windowTop + WINDOW_SIZE - CORNER_SIZE,
              left: windowLeft,
              width: CORNER_SIZE,
              height: CORNER_SIZE,
              borderBottomWidth: CORNER_THICKNESS,
              borderLeftWidth: CORNER_THICKNESS,
              borderColor: RED,
              borderBottomLeftRadius: 4,
            }}
          />
          {/* Bottom Right */}
          <View
            style={{
              position: "absolute",
              top: windowTop + WINDOW_SIZE - CORNER_SIZE,
              left: windowLeft + WINDOW_SIZE - CORNER_SIZE,
              width: CORNER_SIZE,
              height: CORNER_SIZE,
              borderBottomWidth: CORNER_THICKNESS,
              borderRightWidth: CORNER_THICKNESS,
              borderColor: RED,
              borderBottomRightRadius: 4,
            }}
          />
        </View>
      )}

      {/* Top bar */}
      <SafeAreaView className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-4 pt-2">
        <Pressable
          className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          onPress={() => router.back()}
        >
          <Text className="text-white text-base font-semibold">✕</Text>
        </Pressable>
        <Text className="text-white text-base font-bold tracking-wide">
          Scan QR Code
        </Text>
        <View className="w-10" />
      </SafeAreaView>

      {/* Bottom panel */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-12 pt-6 items-center gap-4">
        {scanState === "idle" && (
          <Text className="text-white/70 text-sm text-center leading-5">
            Point your camera at the session QR code
          </Text>
        )}

        {scanState === "loading" && (
          <View className="bg-white rounded-2xl p-6 items-center gap-3 w-full">
            <ActivityIndicator color={RED} size="small" />
            <Text className="text-sm font-medium text-gray-600">
              Submitting attendance...
            </Text>
          </View>
        )}

        {scanState === "success" && (
          <View className="bg-white rounded-2xl p-6 items-center gap-3 w-full">
            <View className="w-14 h-14 rounded-full border-2 border-green-500 bg-green-50 items-center justify-center">
              <Text className="text-2xl">✓</Text>
            </View>
            <Text className="text-sm font-medium text-green-600 text-center leading-5">
              {message}
            </Text>
            <Pressable
              className="bg-red-600 rounded-xl py-3 px-8 mt-1"
              onPress={() => router.back()}
            >
              <Text className="text-white font-bold text-base">Done</Text>
            </Pressable>
          </View>
        )}

        {scanState === "error" && (
          <View className="bg-white rounded-2xl p-6 items-center gap-3 w-full">
            <View className="w-14 h-14 rounded-full border-2 border-red-600 bg-red-50 items-center justify-center">
              <Text className="text-2xl">✕</Text>
            </View>
            <Text className="text-sm font-medium text-red-600 text-center leading-5">
              {message}
            </Text>
            <Pressable
              className="bg-red-600 rounded-xl py-3 px-8 mt-1"
              onPress={handleReset}
            >
              <Text className="text-white font-bold text-base">Try Again</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
