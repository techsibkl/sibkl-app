import auth from "@react-native-firebase/auth";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import ReauthModal from "./components/ReauthModel";

export default function ChangePasswordScreen() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showReauth, setShowReauth] = useState(false);
	const [loading, setLoading] = useState(false);

	const user = auth().currentUser;

	const handleSave = async () => {
		if (!user) return;
		setLoading(true);

		// Basic validation
		if (newPassword !== confirmPassword) {
			setLoading(false);
			return Alert.alert("Error", "New passwords do not match.");
		}

		try {
			// Try updating password first (may throw requires-recent-login)
			await user.updatePassword(newPassword);

			Alert.alert("Success", "Password updated successfully!");
		} catch (err: any) {
			if (err.code === "auth/requires-recent-login") {
				setShowReauth(true); // show re-auth modal
			} else {
				Alert.alert("Error", err.message);
			}
		} finally {
			setLoading(false);
		}
	};

	const reset = () => {
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
	};

	return (
		<View className="flex-1 bg-background px-6 gap-1">
			<Text>Current Password</Text>
			<TextInput
				secureTextEntry
				value={currentPassword}
				onChangeText={setCurrentPassword}
				style={styles.input}
			/>

			<Text>New Password</Text>
			<TextInput
				secureTextEntry
				value={newPassword}
				onChangeText={setNewPassword}
				style={styles.input}
			/>

			<Text>Confirm New Password</Text>
			<TextInput
				secureTextEntry
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				style={styles.input}
			/>

			<TouchableOpacity
				onPress={handleSave}
				disabled={loading}
				className="bg-red-700 py-4 rounded-2xl items-center"
			>
				{loading ? (
					<ActivityIndicator color="white" />
				) : (
					<Text className="text-white font-semibold text-lg">
						Change password
					</Text>
				)}
			</TouchableOpacity>

			{/* Re-authenticate modal */}
			{showReauth && (
				<ReauthModal
					onClose={() => {
						setShowReauth(false);
						setLoading(false);
					}}
					onSuccess={async () => {
						setShowReauth(false);
						// After re-authenticate, retry password update
						try {
							await user?.updatePassword(newPassword);
							Alert.alert(
								"Success",
								"Password updated successfully!"
							);

							reset();
						} catch (e: any) {
							Alert.alert("Error", e.message);
						} finally {
							setLoading(false);
						}
					}}
				/>
			)}
		</View>
	);
}

const styles = {
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 12,
		borderRadius: 8,
		marginBottom: 15,
	},
};
