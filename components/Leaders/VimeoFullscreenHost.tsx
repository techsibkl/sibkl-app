import { withVimeoAutoplay } from "@/utils/vimeo";
import { XIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Modal, StatusBar, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import VimeoPlayer from "./VimeoPlayer";

type FullscreenVideo = {
	embedUrl: string;
	title: string;
};

type Listener = (video: FullscreenVideo | null) => void;

let listener: Listener | null = null;

export function openVimeoFullscreen(embedUrl: string, title: string) {
	listener?.({ embedUrl, title });
}

const VimeoFullscreenHost = () => {
	const insets = useSafeAreaInsets();
	const [video, setVideo] = useState<FullscreenVideo | null>(null);

	useEffect(() => {
		listener = setVideo;
		return () => {
			if (listener === setVideo) listener = null;
		};
	}, []);

	return (
		<Modal
			visible={!!video}
			animationType="fade"
			presentationStyle="fullScreen"
			statusBarTranslucent
			onRequestClose={() => setVideo(null)}
		>
			<View className="flex-1 bg-black">
				<StatusBar barStyle="light-content" />
				{video && (
					<VimeoPlayer
						embedUrl={withVimeoAutoplay(video.embedUrl)}
						title={video.title}
						fill
					/>
				)}
				<TouchableOpacity
					onPress={() => setVideo(null)}
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

export default VimeoFullscreenHost;
