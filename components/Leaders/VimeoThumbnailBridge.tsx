import { VIMEO_EMBED_ORIGIN, vimeoThumbnailHtml } from "@/utils/vimeo";
import {
	bindVimeoThumbnailLoader,
	settleVimeoThumbnail,
} from "@/utils/vimeoThumbnail";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

const VimeoThumbnailBridge = () => {
	const [active, setActive] = useState<string | null>(null);
	const queueRef = useRef<string[]>([]);
	const activeRef = useRef<string | null>(null);

	const pump = useCallback(() => {
		if (activeRef.current) return;
		const next = queueRef.current.shift();
		if (!next) return;
		activeRef.current = next;
		setActive(next);
	}, []);

	const finish = useCallback((link: string, thumbnail: string | null) => {
		if (activeRef.current !== link) return;
		activeRef.current = null;
		settleVimeoThumbnail(link, thumbnail);
		setActive(null);
	}, []);

	useEffect(() => {
		return bindVimeoThumbnailLoader((link) => {
			if (queueRef.current.includes(link) || activeRef.current === link) {
				return;
			}
			queueRef.current.push(link);
			pump();
		});
	}, [pump]);

	useEffect(() => {
		if (!active) {
			pump();
			return;
		}
		const link = active;
		const timer = setTimeout(() => finish(link, null), 8000);
		return () => clearTimeout(timer);
	}, [active, finish, pump]);

	if (!active) return null;

	const link = active;
	const onMessage = (event: WebViewMessageEvent) => {
		try {
			const data = JSON.parse(event.nativeEvent.data) as {
				thumbnail?: string | null;
			};
			finish(link, data.thumbnail ?? null);
		} catch {
			finish(link, null);
		}
	};

	return (
		<View
			pointerEvents="none"
			collapsable={false}
			style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
		>
			<WebView
				source={{
					html: vimeoThumbnailHtml(link),
					baseUrl: VIMEO_EMBED_ORIGIN,
				}}
				onMessage={onMessage}
				onError={() => finish(link, null)}
				originWhitelist={["*"]}
				javaScriptEnabled
			/>
		</View>
	);
};

export default VimeoThumbnailBridge;
