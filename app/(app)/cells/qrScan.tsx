import { useAuthStore } from "@/stores/authStore";
import { secureFetch } from "@/utils/secureFetch";
import { CameraView } from "expo-camera";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RED = "#d6361e";

type ScanState = "idle" | "loading" | "success" | "error";

export default function QrScan() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [message, setMessage] = useState("");
  const personId = useAuthStore((state) => state.user?.person?.id);

  const handleScan = useCallback(
    async ({ data }: { data: string }) => {
      if (scanState !== "idle") return;
      setScanState("loading");

      try {
        const response = await secureFetch(
          `http://192.168.1.100:5001/leafy-loader-444703-d0/us-central1/cells/${data}/sign-in-to-session`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              attendance_id: data,
              people_id: personId,
            }),
          },
        );

        const result = await response.json();
        console.log("Attendance Result:", result);
        setMessage("Attendance recorded successfully!");
        setScanState("success");
      } catch (err) {
        console.error(err);
        setMessage("Failed to submit attendance. Please try again.");
        setScanState("error");
      }
    },
    [scanState, personId],
  );

  const handleReset = () => {
    setScanState("idle");
    setMessage("");
  };

  return (
    <View style={styles.root}>
      {Platform.OS === "android" && <StatusBar hidden />}

      {/* Full screen camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: "qr" }}
        onBarcodeScanned={scanState === "idle" ? handleScan : undefined}
      />

      {/* Dark overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Top dark region */}
        <View style={styles.overlayTop} />

        {/* Middle row: dark | clear window | dark */}
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanWindow} />
          <View style={styles.overlaySide} />
        </View>

        {/* Bottom dark region */}
        <View style={styles.overlayBottom} />
      </View>

      {/* Corner brackets on the scan window */}
      <View style={styles.bracketsContainer} pointerEvents="none">
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
      </View>

      {/* Top bar */}
      <SafeAreaView style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>✕</Text>
        </Pressable>
        <Text style={styles.topTitle}>Scan QR Code</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      {/* Bottom UI */}
      <View style={styles.bottomPanel}>
        {scanState === "idle" && (
          <Text style={styles.hint}>
            Point your camera at the session QR code
          </Text>
        )}

        {scanState === "loading" && (
          <View style={styles.feedbackBox}>
            <ActivityIndicator color={RED} size="small" />
            <Text style={styles.feedbackText}>Submitting attendance...</Text>
          </View>
        )}

        {scanState === "success" && (
          <View style={styles.feedbackBox}>
            <View style={[styles.feedbackIcon, { borderColor: "#22c55e" }]}>
              <Text style={{ fontSize: 22 }}>✓</Text>
            </View>
            <Text style={[styles.feedbackText, { color: "#22c55e" }]}>
              {message}
            </Text>
            <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
              <Text style={styles.primaryBtnText}>Done</Text>
            </Pressable>
          </View>
        )}

        {scanState === "error" && (
          <View style={styles.feedbackBox}>
            <View style={[styles.feedbackIcon, { borderColor: RED }]}>
              <Text style={{ fontSize: 22 }}>✕</Text>
            </View>
            <Text style={[styles.feedbackText, { color: RED }]}>{message}</Text>
            <Pressable style={styles.primaryBtn} onPress={handleReset}>
              <Text style={styles.primaryBtnText}>Try Again</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const WINDOW_SIZE = 260;
const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  // Cutout overlay
  overlayTop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  overlayMiddle: { flexDirection: "row", height: WINDOW_SIZE },
  overlaySide: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  scanWindow: { width: WINDOW_SIZE, height: WINDOW_SIZE },
  overlayBottom: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },

  // Corner brackets
  bracketsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: RED,
  },
  cornerTL: {
    top: "50%",
    left: "50%",
    marginTop: -(WINDOW_SIZE / 2),
    marginLeft: -(WINDOW_SIZE / 2),
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: "50%",
    right: "50%",
    marginTop: -(WINDOW_SIZE / 2),
    marginRight: -(WINDOW_SIZE / 2),
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: "50%",
    left: "50%",
    marginBottom: -(WINDOW_SIZE / 2),
    marginLeft: -(WINDOW_SIZE / 2),
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: "50%",
    right: "50%",
    marginBottom: -(WINDOW_SIZE / 2),
    marginRight: -(WINDOW_SIZE / 2),
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 4,
  },

  // Top bar
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  topTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Bottom panel
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 24,
    alignItems: "center",
    gap: 16,
  },
  hint: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  feedbackBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  feedbackIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#444",
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: RED,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 4,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
