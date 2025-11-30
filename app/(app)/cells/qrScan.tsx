import { useAuthStore } from "@/stores/authStore";
import { secureFetch } from "@/utils/secureFetch";
import { CameraView } from "expo-camera";
import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";

export default function QrScan() {
  const [scanned, setScanned] = useState(false);
  const personId = useAuthStore((state) => state.user?.person?.id);
  const handleScan = useCallback(
    async ({ data }: { data: string }) => {
      if (scanned) return; // Prevent duplicate scans
      setScanned(true);

      try {
        console.log("Scanned QR Code:", data);
        console.log("Person Id:", personId);
        //data is supposed to be the attendance_id

        // Call attendance endpoint
        const response = await secureFetch(
          `http://192.168.1.101:5001/leafy-loader-444703-d0/us-central1/cells/${1}/sign-in-to-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              attendance_id: 1,
              people_id: personId, // replace with the logged-in user
            }),
          }
        );

        const result = await response.json();
        console.log("Attendance Result:", result);

        Alert.alert("Success", "Your attendance has been recorded!");
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to submit attendance.");
      } finally {
        setTimeout(() => setScanned(false), 1500); // Allow scanning again later
      }
    },
    [scanned]
  );

  return (
    <SafeAreaView style={styleSheet.container}>
      {Platform.OS === "android" ? <StatusBar hidden /> : null}

      <CameraView
        style={styleSheet.camStyle}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: "qr",
        }}
        onBarcodeScanned={handleScan}
      />
    </SafeAreaView>
  );
}

const styleSheet = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    rowGap: 20,
  },
  camStyle: {
    position: "absolute",
    width: 300,
    height: 300,
  },
});
