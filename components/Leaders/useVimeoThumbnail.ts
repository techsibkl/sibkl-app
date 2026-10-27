import {
	readVimeoThumbnail,
	requestVimeoThumbnail,
} from "@/utils/vimeoThumbnail";
import { useEffect, useState } from "react";

export function useVimeoThumbnail(link?: string | null) {
	const [state, setState] = useState(() => {
		if (!link) return { url: null as string | null, pending: false };
		const cached = readVimeoThumbnail(link);
		if (cached !== undefined) return { url: cached, pending: false };
		return { url: null as string | null, pending: true };
	});

	useEffect(() => {
		if (!link) {
			setState({ url: null, pending: false });
			return;
		}
		const cached = readVimeoThumbnail(link);
		if (cached !== undefined) {
			setState({ url: cached, pending: false });
			return;
		}
		setState({ url: null, pending: true });
		return requestVimeoThumbnail(link, (url) => {
			setState({ url, pending: false });
		});
	}, [link]);

	return state;
}
