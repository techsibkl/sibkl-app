import { XIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
	Dimensions,
	GestureResponderEvent,
	Modal,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
const SCREEN_HEIGHT = Dimensions.get("window").height;

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
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		if (visible) {
			const t = setTimeout(() => setIsReady(true), 10);
			return () => clearTimeout(t);
		} else {
			setIsReady(false);
		}
	}, [visible]);

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
					{isReady && children}
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
		// height: SCREEN_HEIGHT * 0.8, // ✅ instead of "80%"
		maxHeight: SCREEN_HEIGHT * 0.8,
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
