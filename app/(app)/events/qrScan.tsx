import { useEventCheckInMutation } from "@/hooks/Event/useEventCheckInMutation";
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
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScanState = "idle" | "loading" | "success" | "error";

export default function EventQrScan() {
	const [scanState, setScanState] = useState<ScanState>("idle");
	const [message, setMessage] = useState("");
	const [permission, requestPermission] = useCameraPermissions();

	const { eventId, participantId } = useLocalSearchParams<{
		eventId: string;
		participantId: string;
	}>();
	const resolvedEventId = Array.isArray(eventId) ? eventId[0] : eventId;
	const resolvedParticipantId = Array.isArray(participantId)
		? participantId[0]
		: participantId;

	const { mutateAsync: checkIn } = useEventCheckInMutation(
		resolvedEventId ?? "",
	);

	useEffect(() => {
		if (
			permission !== null &&
			!permission.granted &&
			permission.canAskAgain
		) {
			requestPermission();
		}
	}, [permission, requestPermission]);

	const handleScan = useCallback(
		async ({ data }: { data: string }) => {
			if (
				scanState !== "idle" ||
				!resolvedEventId ||
				!resolvedParticipantId
			) {
				return;
			}

			if (data.trim() !== String(resolvedEventId)) {
				setMessage("This QR is not for this event.");
				setScanState("error");
				return;
			}

			setScanState("loading");
			try {
				await checkIn(resolvedParticipantId);
				setMessage("Checked in successfully!");
				setScanState("success");
			} catch (err: any) {
				setMessage(
					err?.message ?? "Failed to check in. Please try again.",
				);
				setScanState("error");
			}
		},
		[scanState, resolvedEventId, resolvedParticipantId, checkIn],
	);

	const handleReset = () => {
		setScanState("idle");
		setMessage("");
	};

	if (permission === null) {
		return (
			<View className="flex-1 bg-white items-center justify-center">
				<ActivityIndicator size="large" color="#d6361e" />
			</View>
		);
	}

	if (!permission.granted) {
		return (
			<SafeAreaView className="flex-1 bg-white justify-center px-6">
				<View className="gap-9">
					<View className="gap-2.5">
						<View className="h-1 w-9 rounded-sm bg-primary-500" />
						<Text className="text-[26px] font-bold text-gray-900 tracking-tight">
							Camera Access
						</Text>
						<Text className="text-[15px] text-gray-400 leading-[22px]">
							{permission.canAskAgain
								? "We need camera access to scan the event QR code for check-in."
								: "Camera permission was denied. Please enable it in your device settings to continue."}
						</Text>
					</View>

					<View className="self-center h-[120px] w-[120px] rounded-full border-2 border-primary-500 bg-[#fff5f3] items-center justify-center">
						<Text className="text-5xl">📷</Text>
					</View>

					<View className="gap-3">
						{permission.canAskAgain ? (
							<Pressable
								className="bg-primary-500 rounded-xl py-4 items-center"
								onPress={requestPermission}
							>
								<Text className="text-white font-bold text-base">
									Allow Camera Access
								</Text>
							</Pressable>
						) : (
							<View className="rounded-[10px] border-[1.5px] border-primary-500 bg-[#fff5f3] p-4">
								<Text className="text-primary-500 text-sm leading-5 text-center">
									Open Settings → Privacy → Camera and enable
									access for this app.
								</Text>
							</View>
						)}

						<Pressable
							className="rounded-xl border-[1.5px] border-primary-500 py-3.5 items-center"
							onPress={() => router.back()}
						>
							<Text className="text-primary-500 font-bold text-[15px]">
								Go Back
							</Text>
						</Pressable>
					</View>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<View style={styles.root}>
			{Platform.OS === "android" && <StatusBar hidden />}

			<CameraView
				style={StyleSheet.absoluteFillObject}
				facing="back"
				barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
				onBarcodeScanned={scanState === "idle" ? handleScan : undefined}
			/>

			<SafeAreaView
				className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 pt-2"
				edges={["top"]}
			>
				<Pressable
					className="h-10 w-10 rounded-full bg-white/20 items-center justify-center"
					onPress={() => router.back()}
				>
					<Text className="text-white text-base font-semibold">✕</Text>
				</Pressable>
				<Text className="text-white text-base font-bold tracking-wide">
					Scan QR Code
				</Text>
				<View className="w-10" />
			</SafeAreaView>

			<View className="absolute bottom-0 left-0 right-0 z-10 px-6 pt-6 pb-12 items-center gap-4">
				{scanState === "idle" && (
					<Text className="text-white/70 text-sm text-center leading-5">
						Point your camera at the event QR code
					</Text>
				)}

				{scanState === "loading" && (
					<View className="w-full bg-white rounded-2xl p-6 items-center gap-3">
						<ActivityIndicator color="#d6361e" size="small" />
						<Text className="text-sm font-medium text-gray-700 text-center">
							Checking in...
						</Text>
					</View>
				)}

				{scanState === "success" && (
					<View className="w-full bg-white rounded-2xl p-6 items-center gap-3">
						<View className="h-[52px] w-[52px] rounded-full border-2 border-green-500 items-center justify-center">
							<Text className="text-[22px]">✓</Text>
						</View>
						<Text className="text-sm font-medium text-green-500 text-center">
							{message}
						</Text>
						<Pressable
							className="bg-primary-500 rounded-[10px] py-3 px-8 mt-1"
							onPress={() => router.back()}
						>
							<Text className="text-white font-bold text-[15px]">
								Done
							</Text>
						</Pressable>
					</View>
				)}

				{scanState === "error" && (
					<View className="w-full bg-white rounded-2xl p-6 items-center gap-3">
						<View className="h-[52px] w-[52px] rounded-full border-2 border-primary-500 items-center justify-center">
							<Text className="text-[22px]">✕</Text>
						</View>
						<Text className="text-sm font-medium text-primary-500 text-center">
							{message}
						</Text>
						<Pressable
							className="bg-primary-500 rounded-[10px] py-3 px-8 mt-1"
							onPress={handleReset}
						>
							<Text className="text-white font-bold text-[15px]">
								Try Again
							</Text>
						</Pressable>
					</View>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: "#000" },
});
