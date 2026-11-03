import { VIMEO_EMBED_ORIGIN, vimeoEmbedHtml } from "@/utils/vimeo";
import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

type VimeoPlayerProps = {
	embedUrl: string;
	title: string;
	fill?: boolean;
};

const VimeoPlayer = ({ embedUrl, title, fill = false }: VimeoPlayerProps) => {
	return (
		<View
			className="w-full bg-black"
			style={fill ? { flex: 1 } : { aspectRatio: 16 / 9 }}
		>
			<WebView
				source={{
					html: vimeoEmbedHtml(embedUrl, title),
					baseUrl: VIMEO_EMBED_ORIGIN,
				}}
				originWhitelist={["*"]}
				style={{ flex: 1, backgroundColor: "#000" }}
				allowsInlineMediaPlayback
				allowsFullscreenVideo
				mediaPlaybackRequiresUserAction={false}
				javaScriptEnabled
				domStorageEnabled
				scrollEnabled={false}
				setSupportMultipleWindows={false}
			/>
		</View>
	);
};

export default VimeoPlayer;
