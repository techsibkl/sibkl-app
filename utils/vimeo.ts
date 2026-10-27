export type VimeoVideo = {
	id: string;
	hash?: string;
};

/**
 * Domain privacy checks the embedding page's Referer. Vimeo has no app-id
 * allowlist, so the in-app player uses a domain already on that list.
 * Keep the trailing slash: Android uses it as the document origin.
 */
export const VIMEO_EMBED_ORIGIN = "https://sibklcms-prod.web.app/";

function withProtocol(input: string) {
	const trimmed = input.trim();
	return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Accepts vimeo.com and player.vimeo.com links, including unlisted privacy hashes. */
export function parseVimeoLink(input?: string | null): VimeoVideo | null {
	if (!input?.trim()) return null;

	let url: URL;
	try {
		url = new URL(withProtocol(input));
	} catch {
		return null;
	}

	const host = url.hostname.replace(/^www\./, "");
	if (host === "player.vimeo.com") {
		const match = url.pathname.match(/^\/video\/(\d+)\/?$/);
		if (!match) return null;
		return { id: match[1], hash: url.searchParams.get("h") || undefined };
	}

	if (host !== "vimeo.com") return null;

	const parts = url.pathname.split("/").filter(Boolean);
	const keywordAt = parts.findIndex(
		(part) => part === "video" || part === "videos",
	);

	let id: string | undefined;
	let hash: string | undefined;

	if (keywordAt >= 0 && /^\d+$/.test(parts[keywordAt + 1] ?? "")) {
		id = parts[keywordAt + 1];
		const next = parts[keywordAt + 2];
		if (next && /^[A-Za-z0-9]+$/.test(next)) hash = next;
	} else {
		for (let i = parts.length - 1; i >= 0; i--) {
			if (/^\d{6,}$/.test(parts[i])) {
				id = parts[i];
				const next = parts[i + 1];
				if (next && /^[A-Za-z0-9]+$/.test(next)) hash = next;
				break;
			}
		}
	}

	if (!id) return null;
	return { id, hash: hash || url.searchParams.get("h") || undefined };
}

export function toVimeoEmbedUrl(input?: string | null): string | null {
	const video = parseVimeoLink(input);
	if (!video) return null;

	const params = new URLSearchParams({
		badge: "0",
		autopause: "0",
		player_id: "0",
		playsinline: "1",
	});
	if (video.hash) params.set("h", video.hash);
	return `https://player.vimeo.com/video/${video.id}?${params.toString()}`;
}

export function withVimeoAutoplay(embedUrl: string) {
	const url = new URL(embedUrl);
	url.searchParams.set("autoplay", "1");
	return url.toString();
}

/** Loads inside a WebView whose base URL is VIMEO_EMBED_ORIGIN, so oEmbed sends that Referer. */
export function vimeoThumbnailHtml(pageUrl: string) {
	const endpoint = JSON.stringify(
		`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(pageUrl.trim())}&width=1280`,
	);
	return `<!DOCTYPE html><html><body><script>
    fetch(${endpoint})
      .then(function (res) { return res.json(); })
      .then(function (data) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ thumbnail: data.thumbnail_url || null }));
      })
      .catch(function () {
        window.ReactNativeWebView.postMessage(JSON.stringify({ thumbnail: null }));
      });
  </script></body></html>`;
}

function escapeHtml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

/** Player document. Its base URL must be VIMEO_EMBED_ORIGIN so Vimeo sees that Referer. */
export function vimeoEmbedHtml(embedUrl: string, title: string) {
	const src = escapeHtml(embedUrl);
	const safeTitle = escapeHtml(title);
	return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>
  html, body { margin: 0; padding: 0; height: 100%; background: #000; }
  iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
</style>
</head>
<body>
<iframe
  src="${src}"
  allow="autoplay; fullscreen; encrypted-media"
  allowfullscreen
  playsinline
  referrerpolicy="strict-origin-when-cross-origin"
  title="${safeTitle}"
></iframe>
</body>
</html>`;
}
