import { withVimeoAutoplay } from "@/utils/vimeo";
import { XIcon } from "lucide-react-native";
import React from "react";
import { Modal, StatusBar, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import VimeoPlayer from "./VimeoPlayer";

type VimeoFullscreenModalProps = {
	visible: boolean;
	embedUrl: string;
	title: string;
	onClose: () => void;
};

/**
 * Render this inside the modal that opens it. On iOS a Modal is presented by
 * its parent's view controller; one mounted outside an already-open Modal
 * cannot present and leaves the app unresponsive.
 */
const VimeoFullscreenModal = ({
	visible,
	embedUrl,
	title,
	onClose,
}: VimeoFullscreenModalProps) => {
	const insets = useSafeAreaInsets();

	return (
		<Modal
			visible={visible}
			animationType="fade"
			presentationStyle="fullScreen"
			statusBarTranslucent
			onRequestClose={onClose}
		>
			<View className="flex-1 bg-black">
				<StatusBar barStyle="light-content" />
				{visible && (
					<VimeoPlayer
						embedUrl={withVimeoAutoplay(embedUrl)}
						title={title}
						fill
					/>
				)}
				<TouchableOpacity
					onPress={onClose}
					style={{
						position: "absolute",
						top: insets.top + 12,
						right: 16,
						zIndex: 2,
						elevation: 4,
						width: 36,
						height: 36,
						borderRadius: 18,
						backgroundColor: "rgba(0,0,0,0.55)",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<XIcon size={18} color="#fff" />
				</TouchableOpacity>
			</View>
		</Modal>
	);
};

export default VimeoFullscreenModal;
