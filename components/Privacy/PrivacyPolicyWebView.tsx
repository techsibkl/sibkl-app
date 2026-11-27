import { PRIVACY_POLICY_URL } from "@/constants/privacyPolicy";
import React, { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { WebView } from "react-native-webview";

export function PrivacyPolicyWebView() {
	const [failed, setFailed] = useState(false);

	if (failed) {
		return (
			<View className="flex-1 items-center justify-center px-6">
				<Text className="text-sm text-gray-600 text-center">
					The privacy notice could not be loaded. Check your connection and try again.
				</Text>
			</View>
		);
	}

	return (
		<WebView
			source={{ uri: PRIVACY_POLICY_URL }}
			style={{ flex: 1, backgroundColor: "transparent" }}
			originWhitelist={["*"]}
			javaScriptEnabled
			domStorageEnabled
			setSupportMultipleWindows={false}
			startInLoadingState
			renderLoading={() => (
				<View className="absolute inset-0 items-center justify-center">
					<ActivityIndicator color="#2563eb" />
				</View>
			)}
			onError={() => setFailed(true)}
			onHttpError={() => setFailed(true)}
		/>
	);
}
