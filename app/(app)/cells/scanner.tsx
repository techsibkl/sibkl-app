import { useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RED = "#d6361e";

const ScannerPage = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);
  const isLoading = permission === null; // null = still checking

  // Auto-prompt on first open
  useEffect(() => {
    if (permission !== null && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Auto-navigate if already granted
  useEffect(() => {
    if (isPermissionGranted) {
      router.replace("/(app)/cells/qrScan");
    }
  }, [isPermissionGranted]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {isLoading ? (
        <ActivityIndicator size="large" color={RED} />
      ) : (
        <View style={styles.content}>
          {/* Top accent + heading */}
          <View style={styles.header}>
            <View style={styles.accent} />
            <Text style={styles.title}>Camera Access</Text>
            <Text style={styles.subtitle}>
              {permission?.canAskAgain
                ? "We need camera access to scan QR codes for attendance."
                : "Camera permission was denied. Please enable it in your device settings to continue."}
            </Text>
          </View>

          {/* Camera icon illustration */}
          <View style={styles.iconWrapper}>
            <Text style={styles.icon}>📷</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            {permission?.canAskAgain ? (
              <Pressable style={styles.primaryBtn} onPress={requestPermission}>
                <Text style={styles.primaryBtnText}>Allow Camera Access</Text>
              </Pressable>
            ) : (
              <View style={styles.deniedBox}>
                <Text style={styles.deniedText}>
                  Open Settings → Privacy → Camera and enable access for this
                  app.
                </Text>
              </View>
            )}

            <Pressable
              style={styles.secondaryBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryBtnText}>Go Back</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ScannerPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 36,
  },
  header: { gap: 10 },
  accent: {
    width: 36,
    height: 4,
    backgroundColor: RED,
    borderRadius: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    lineHeight: 22,
  },
  iconWrapper: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff5f3",
    borderWidth: 2,
    borderColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 48 },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: RED,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: RED,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: RED,
    fontWeight: "700",
    fontSize: 15,
  },
  deniedBox: {
    backgroundColor: "#fff5f3",
    borderWidth: 1.5,
    borderColor: RED,
    borderRadius: 10,
    padding: 16,
  },
  deniedText: {
    color: RED,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
