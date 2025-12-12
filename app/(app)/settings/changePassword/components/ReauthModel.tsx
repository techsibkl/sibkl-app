// ReauthModal.tsx

import { formStyles } from "@/constants/const_styles";
import auth from "@react-native-firebase/auth";
import React, { useState } from "react";
import {
	Alert,
	Modal,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export default function ReauthModal({ onClose, onSuccess }: any) {
	const [password, setPassword] = useState("");

	const handleReauth = async () => {
		const user = auth().currentUser;
		if (!user || !user.email) return;

		const credential = auth.EmailAuthProvider.credential(
			user.email,
			password
		);

		try {
			await user.reauthenticateWithCredential(credential);
			onSuccess();
		} catch (err: any) {
			Alert.alert("Re-authentication Failed", err.message);
		} finally {
			onClose();
		}
	};

	return (
		<Modal transparent animationType="slide">
			<View className="flex-1 justify-center align-center items-center">
				<View className="w-[85%] rounded-[15px] bg-white">
					<View className="px-8 py-8 items-center justify-center">
						<Text className="font-bold text-xl">
							Verify Identity
						</Text>
						<Text className="mb-4 text-center">
							Please enter your current password.
						</Text>

						<TextInput
							secureTextEntry
							value={password}
							onChangeText={setPassword}
							className={`${formStyles.inputText}`}
							placeholder="Current password"
						/>
					</View>
					<TouchableOpacity
						onPress={handleReauth}
						className="w-full py-6 items-center justify-center border-t border-border"
					>
						<Text className="text-blue-600 font-semibold">
							Verify
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						className="w-full py-6 items-center justify-center border-t border-border"
						onPress={onClose}
					>
						<View className="flex-row items-center gap-2">
							<Text className="text-gray-500">Back</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

const styles = {
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "center",
		alignItems: "center",
	},
	modal: {
		width: "85%",
		backgroundColor: "#fff",
		padding: 20,
		borderRadius: 12,
		elevation: 4,
	},
	title: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 10,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 12,
		borderRadius: 8,
		marginBottom: 15,
	},
};
