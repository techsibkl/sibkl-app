import React, { useState } from "react";
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { AlertCircle } from "lucide-react-native";

interface ConfirmDialogProps {
	visible: boolean;
	onClose: () => void;
	title: string;
	description: string;
	actionText?: string;
	cancelText?: string;
	onConfirm: () => Promise<void> | void;
	isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	visible,
	onClose,
	title,
	description,
	actionText = "Confirm",
	cancelText = "Cancel",
	onConfirm,
	isDestructive = false,
}) => {
	const [loading, setLoading] = useState(false);

	const handleConfirm = async () => {
		setLoading(true);
		try {
			await onConfirm();
			onClose();
		} finally {
			setLoading(false);
		}
	};

	const actionButtonColor = isDestructive ? "#dc2626" : "#0066cc";
	const actionButtonBgColor = isDestructive ? "#fee2e2" : "#dbeafe";

	return (
		<Modal visible={visible} transparent animationType="fade">
			<View className="flex-1 bg-black/50 justify-center items-center">
				<View className="bg-white rounded-2xl mx-5 p-6 shadow-lg">
					<View className="flex-row items-center mb-4 gap-3">
						{isDestructive && (
							<AlertCircle
								size={24}
								color="#dc2626"
								className="mr-2"
							/>
						)}
						<Text className="text-lg font-bold text-black flex-1">
							{title}
						</Text>
					</View>

					<Text className="text-sm text-gray-600 leading-5 mb-6">
						{description}
					</Text>

					<View className="flex-row gap-3 justify-end">
						<TouchableOpacity
							className="px-4 py-2.5 rounded-lg min-w-[100px] items-center justify-center bg-gray-100"
							onPress={onClose}
							disabled={loading}
						>
							<Text className="text-sm font-semibold text-black">
								{cancelText}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							className="px-4 py-2.5 rounded-lg min-w-[120px] items-center justify-center"
							style={{ backgroundColor: actionButtonBgColor }}
							onPress={handleConfirm}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator
									size="small"
									color={actionButtonColor}
								/>
							) : (
								<Text
									className="text-sm font-semibold"
									style={{ color: actionButtonColor }}
								>
									{actionText}
								</Text>
							)}
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default ConfirmDialog;
