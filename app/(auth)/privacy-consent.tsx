import { PrivacyPolicyWebView } from "@/components/Privacy/PrivacyPolicyWebView";
import { grantPrivacyConsent } from "@/services/Privacy/privacyConsent.service";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Platform,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function PrivacyConsentScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { firebaseUser, privacyConsentError, loadPrivacyConsent, signOut } =
		useAuthStore();
	const [submitting, setSubmitting] = useState(false);
	const email = firebaseUser?.email ?? "";

	const onAgree = async () => {
		if (submitting) return;
		setSubmitting(true);
		try {
			const status = await grantPrivacyConsent(Platform.OS);
			useAuthStore.setState({
				privacyConsent: "accepted",
				privacyConsentEmail: status.email,
				privacyConsentedAt: status.consented_at ?? new Date().toISOString(),
				privacyConsentError: null,
			});
			Toast.show({
				type: status.email_sent ? "success" : "error",
				text1: status.email_sent ? "Confirmation sent" : "Confirmation email was not sent",
				text2: status.email_sent
					? `Sent to ${status.email ?? email}`
					: "Your agreement is still recorded.",
			});
		} catch (error) {
			Toast.show({
				type: "error",
				text1: "Agreement was not saved",
				text2: error instanceof Error ? error.message : "Please try again.",
			});
			setSubmitting(false);
		}
	};

	const onDecline = async () => {
		await signOut();
		router.replace("/(auth)/sign-in");
	};

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			{email ? (
				<Text className="text-sm text-gray-600 leading-5 px-5 pt-3 pb-2">
					I agree records this notice for {email}.
				</Text>
			) : null}

			{privacyConsentError ? (
				<View className="mx-5 mb-2 p-3 rounded-lg bg-blue-50">
					<Text className="text-gray-700 text-sm mb-2">
						{privacyConsentError}
					</Text>
					<TouchableOpacity onPress={() => void loadPrivacyConsent()}>
						<Text className="text-blue-600 font-semibold">Try again</Text>
					</TouchableOpacity>
				</View>
			) : null}

			<PrivacyPolicyWebView />

			<View
				className="px-5 pt-3 border-t border-gray-200 bg-background"
				style={{ paddingBottom: Math.max(insets.bottom, 16) }}
			>
				<TouchableOpacity
					className="rounded-xl py-4 items-center bg-blue-600"
					disabled={submitting}
					onPress={() => void onAgree()}
				>
					{submitting ? (
						<ActivityIndicator color="#ffffff" />
					) : (
						<Text className="text-white font-semibold text-base">I agree</Text>
					)}
				</TouchableOpacity>
				<TouchableOpacity
					className="py-4 items-center"
					onPress={() => void onDecline()}
					disabled={submitting}
				>
					<Text className="text-gray-500 font-semibold">
						Decline and sign out
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
