import { toVideoEmbedUrl, toVimeoEmbedUrl } from "@/utils/videoEmbed";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { WebView } from "react-native-webview";

/** Vimeo embeds for these videos are restricted to the production web app. */
const VIMEO_EMBED_ORIGIN = "https://sibklcms-prod.web.app";

function param(value?: string | string[]) {
	return (Array.isArray(value) ? value[0] : value)?.trim() || "";
}

function playerHtml(embedUrl: string) {
	return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    html, body { margin: 0; height: 100%; background: #000; }
    .wrap { position: absolute; inset: 0; }
    iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <iframe
      src="${embedUrl}"
      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
      allowfullscreen
      playsinline
      webkit-playsinline
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  </div>
</body>
</html>`;
}

export default function LeaderVideoPlayer() {
	const params = useLocalSearchParams<{ url?: string; title?: string }>();
	const sourceUrl = param(params.url);
	const embedUrl = toVideoEmbedUrl(sourceUrl);
	const isVimeo = !!toVimeoEmbedUrl(sourceUrl);

	if (!embedUrl) {
		return (
			<View className="flex-1 items-center justify-center bg-black px-6">
				<Text className="text-white text-center">
					This video link can't be played.
				</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-black">
			<WebView
				source={
					isVimeo
						? { html: playerHtml(embedUrl), baseUrl: VIMEO_EMBED_ORIGIN }
						: { uri: embedUrl }
				}
				style={{ flex: 1, backgroundColor: "#000" }}
				allowsFullscreenVideo
				allowsInlineMediaPlayback
				mediaPlaybackRequiresUserAction={false}
				javaScriptEnabled
				domStorageEnabled
				thirdPartyCookiesEnabled
				sharedCookiesEnabled
				startInLoadingState
				renderLoading={() => (
					<View className="absolute inset-0 items-center justify-center">
						<ActivityIndicator color="#ffffff" />
					</View>
				)}
			/>
		</View>
	);
}
