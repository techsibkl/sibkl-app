import { useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ScannerPage = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);

  //   // Request camera permission
  //   useEffect(() => {
  //     (async () => {
  //       const { status } = await BarCodeScanner.requestPermissionsAsync();
  //       setHasPermission(status === "granted");
  //     })();
  //   }, []);

  return (
    <SafeAreaView style={styleSheet.container}>
      <StatusBar style="auto" />

      <Text style={styleSheet.mainText}>Expo QR Code Scanner</Text>

      <Pressable
        style={[styleSheet.mainBtn, styleSheet.btnGreen]}
        onPress={requestPermission}
      >
        <Text>Request Permission</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          router.replace("/(app)/cells/qrScan");
        }}
        style={[
          styleSheet.mainBtn,
          styleSheet.btnYellow,
          { opacity: isPermissionGranted ? 1 : 0.5 },
        ]}
        disabled={!isPermissionGranted}
      >
        <Text>Scan Code</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default ScannerPage;

const styleSheet = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    rowGap: 20,
  },
  mainBtn: {
    width: 200,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  btnGreen: {
    backgroundColor: "#0BCD4C",
  },
  btnYellow: {
    backgroundColor: "yellow",
  },
  mainText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
