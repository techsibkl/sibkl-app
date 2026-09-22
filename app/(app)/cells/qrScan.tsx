import { useSignInToCellSessionMutation } from "@/hooks/CellAttendance/useCellAttendanceMutation";
import { useAuthStore } from "@/stores/authStore";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Platform,
	Pressable,
	StatusBar,
	StyleSheet,
	Text,
	useWindowDimensions,
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
	const { width, height } = useWindowDimensions();
	const [permission] = useCameraPermissions();

	const personId = useAuthStore((state) => state.user?.person?.id);
	const { cell_id } = useLocalSearchParams<{ cell_id: string }>();
	const cellId = Number(Array.isArray(cell_id) ? cell_id[0] : cell_id);
	const { mutateAsync: signIn } = useSignInToCellSessionMutation(
		Number.isFinite(cellId) && cellId > 0 ? cellId : 0,
	);

	// If permission is denied, go back to scanner page
	useEffect(() => {
		if (permission && !permission.granted) {
			router.back();
		}
	}, [permission]);

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
					err?.message ??
						"Failed to submit attendance. Please try again.",
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

	const windowLeft = (width - WINDOW_SIZE) / 2;
	const windowTop = (height - WINDOW_SIZE) / 2;

	// Don't render camera if permission not granted
	if (!permission?.granted) {
		return (
			<View style={[styles.root, { width, height }]}>
				<ActivityIndicator size="large" color={RED} />
			</View>
		);
	}

	return (
		<View style={[styles.root, { width, height }]}>
			{Platform.OS === "android" && <StatusBar hidden />}

			{/* Camera — size from window; flex:1 collapses to 0 in this modal stack */}
			<CameraView
				style={{ width, height }}
				facing="back"
				barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
				onBarcodeScanned={scanState === "idle" ? handleScan : undefined}
			/>

			{/* Dark overlay — 4 exact regions around scan window */}
			<View style={StyleSheet.absoluteFillObject} pointerEvents="none">
					{/* Top */}
					<View
						style={[
							styles.overlay,
							{ top: 0, left: 0, right: 0, height: windowTop },
						]}
					/>
					{/* Bottom */}
					<View
						style={[
							styles.overlay,
							{
								top: windowTop + WINDOW_SIZE,
								left: 0,
								right: 0,
								bottom: 0,
							},
						]}
					/>
					{/* Left */}
					<View
						style={[
							styles.overlay,
							{
								top: windowTop,
								left: 0,
								width: windowLeft,
								height: WINDOW_SIZE,
							},
						]}
					/>
					{/* Right */}
					<View
						style={[
							styles.overlay,
							{
								top: windowTop,
								right: 0,
								width: windowLeft,
								height: WINDOW_SIZE,
							},
						]}
					/>
			</View>

			{/* Corner brackets */}
			<View style={StyleSheet.absoluteFillObject} pointerEvents="none">
					{/* Top Left */}
					<View
						style={[
							styles.corner,
							{
								top: windowTop,
								left: windowLeft,
								borderTopWidth: CORNER_THICKNESS,
								borderLeftWidth: CORNER_THICKNESS,
								borderTopLeftRadius: 4,
							},
						]}
					/>
					{/* Top Right */}
					<View
						style={[
							styles.corner,
							{
								top: windowTop,
								left: windowLeft + WINDOW_SIZE - CORNER_SIZE,
								borderTopWidth: CORNER_THICKNESS,
								borderRightWidth: CORNER_THICKNESS,
								borderTopRightRadius: 4,
							},
						]}
					/>
					{/* Bottom Left */}
					<View
						style={[
							styles.corner,
							{
								top: windowTop + WINDOW_SIZE - CORNER_SIZE,
								left: windowLeft,
								borderBottomWidth: CORNER_THICKNESS,
								borderLeftWidth: CORNER_THICKNESS,
								borderBottomLeftRadius: 4,
							},
						]}
					/>
					{/* Bottom Right */}
					<View
						style={[
							styles.corner,
							{
								top: windowTop + WINDOW_SIZE - CORNER_SIZE,
								left: windowLeft + WINDOW_SIZE - CORNER_SIZE,
								borderBottomWidth: CORNER_THICKNESS,
								borderRightWidth: CORNER_THICKNESS,
								borderBottomRightRadius: 4,
							},
						]}
					/>
			</View>

			{/* Top bar */}
			<SafeAreaView style={styles.topBar}>
				<Pressable
					style={styles.closeBtn}
					onPress={() => router.back()}
				>
					<Text style={styles.closeBtnText}>✕</Text>
				</Pressable>
				<Text style={styles.topTitle}>Scan QR Code</Text>
				<View style={{ width: 40 }} />
			</SafeAreaView>

			{/* Bottom panel */}
			<View style={styles.bottomPanel}>
				{scanState === "idle" && (
					<Text style={styles.hint}>
						Point your camera at the session QR code
					</Text>
				)}

				{scanState === "loading" && (
					<View style={styles.feedbackBox}>
						<ActivityIndicator color={RED} size="small" />
						<Text style={styles.feedbackText}>
							Submitting attendance...
						</Text>
					</View>
				)}

				{scanState === "success" && (
					<View style={styles.feedbackBox}>
						<View
							style={[
								styles.feedbackIcon,
								{ borderColor: "#22c55e" },
							]}
						>
							<Text style={{ fontSize: 22 }}>✓</Text>
						</View>
						<Text
							style={[styles.feedbackText, { color: "#22c55e" }]}
						>
							{message}
						</Text>
						<Pressable
							style={styles.actionBtn}
							onPress={() => router.back()}
						>
							<Text style={styles.actionBtnText}>Done</Text>
						</Pressable>
					</View>
				)}

				{scanState === "error" && (
					<View style={styles.feedbackBox}>
						<View
							style={[styles.feedbackIcon, { borderColor: RED }]}
						>
							<Text style={{ fontSize: 22 }}>✕</Text>
						</View>
						<Text style={[styles.feedbackText, { color: RED }]}>
							{message}
						</Text>
						<Pressable
							style={styles.actionBtn}
							onPress={handleReset}
						>
							<Text style={styles.actionBtnText}>Try Again</Text>
						</Pressable>
					</View>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: { backgroundColor: "#000" },
	overlay: { position: "absolute" },
	corner: {
		position: "absolute",
		width: CORNER_SIZE,
		height: CORNER_SIZE,
		borderColor: RED,
	},
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
	closeBtn: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(255,255,255,0.2)",
		alignItems: "center",
		justifyContent: "center",
	},
	closeBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
	topTitle: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
		letterSpacing: 0.3,
	},
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
	actionBtn: {
		backgroundColor: RED,
		borderRadius: 10,
		paddingVertical: 12,
		paddingHorizontal: 32,
		marginTop: 4,
	},
	actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
