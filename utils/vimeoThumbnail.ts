type ThumbnailListener = (url: string | null) => void;

const cache = new Map<string, string | null>();
const listeners = new Map<string, Set<ThumbnailListener>>();
const inflight = new Set<string>();

let pushLink: ((link: string) => void) | null = null;

function schedule(link: string) {
	if (cache.has(link) || inflight.has(link) || !pushLink) return;
	inflight.add(link);
	pushLink(link);
}

export function readVimeoThumbnail(link: string): string | null | undefined {
	if (!cache.has(link)) return undefined;
	return cache.get(link) ?? null;
}

export function requestVimeoThumbnail(
	link: string,
	listener: ThumbnailListener,
) {
	if (cache.has(link)) {
		listener(cache.get(link) ?? null);
		return () => {};
	}

	const set = listeners.get(link) ?? new Set<ThumbnailListener>();
	set.add(listener);
	listeners.set(link, set);
	schedule(link);

	return () => {
		set.delete(listener);
	};
}

/** One hidden WebView drains this queue so list cards share a single oEmbed lookup. */
export function bindVimeoThumbnailLoader(push: (link: string) => void) {
	pushLink = push;
	for (const link of listeners.keys()) schedule(link);
	return () => {
		if (pushLink === push) pushLink = null;
	};
}

export function settleVimeoThumbnail(link: string, url: string | null) {
	inflight.delete(link);
	cache.set(link, url);
	const set = listeners.get(link);
	listeners.delete(link);
	set?.forEach((listener) => listener(url));
}
