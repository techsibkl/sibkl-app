import { XIcon } from "lucide-react-native";
import React from "react";
import {
	GestureResponderEvent,
	Modal,
	StyleSheet,
	TouchableOpacity,
	View
} from "react-native";

interface SharedModalProps {
	visible: boolean;
	onClose: (event?: GestureResponderEvent) => void;
	children: React.ReactNode;
}

const SharedModal: React.FC<SharedModalProps> = ({
	visible,
	onClose,
	children,
}) => {
	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<View style={styles.contentWrapper}>
					{/* Close Button */}
					<TouchableOpacity
						onPress={onClose}
						style={styles.closeButton}
					>
						<XIcon size={16} color="#222" />
					</TouchableOpacity>

					{/* Content injected here */}
					{children}
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	contentWrapper: {
		position: "relative",
		margin: 16,
		width: "90%",
		maxWidth: 400,
		maxHeight: "80%",
		backgroundColor: "white",
		borderRadius: 15,
		overflow: "hidden",
	},
	closeButton: {
		position: "absolute",
		top: 8,
		right: 8,
		zIndex: 10,
		backgroundColor: "rgba(255,255,255,0.6)",
		borderRadius: 9999,
		width: 32,
		height: 32,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default SharedModal;
