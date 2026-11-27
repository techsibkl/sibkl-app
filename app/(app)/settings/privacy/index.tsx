import { PrivacyPolicyWebView } from "@/components/Privacy/PrivacyPolicyWebView";
import { withdrawPrivacyConsent } from "@/services/Privacy/privacyConsent.service";
import { useAuthStore } from "@/stores/authStore";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
export default function PrivacyNoticeScreen() {
	const { isGuest, signOut } = useAuthStore();
	const [submitting, setSubmitting] = useState(false);

	const handleWithdrawConsent = () => {
		if (submitting) return;
		Alert.alert(
			"Withdraw privacy consent",
			"SIBKL will record this withdrawal against your email. You will be signed out, and the app cannot use your account until you agree to the current notice again.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Withdraw",
					style: "destructive",
					onPress: async () => {
						setSubmitting(true);
						try {
							await withdrawPrivacyConsent();
							await signOut();
						} catch (error) {
							setSubmitting(false);
							Alert.alert(
								"Withdrawal was not saved",
								error instanceof Error
									? error.message
									: "Please try again.",
							);
						}
					},
				},
			],
		);
	};

	return (
		<View className="flex-1 bg-background">
			<PrivacyPolicyWebView />
			{isGuest ? null : (
				<View className="items-center bg-white border-t border-gray-100 py-2">
					<TouchableOpacity
						onPress={handleWithdrawConsent}
						disabled={submitting}
						className="px-4 py-2"
					>
						{submitting ? (
							<ActivityIndicator color="#b91c1c" size="small" />
						) : (
							<Text className="text-red-700 text-sm font-semibold">
								Withdraw consent
							</Text>
						)}
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
}
