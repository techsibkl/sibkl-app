export type VimeoVideo = {
	id: string;
	hash?: string;
};

function withProtocol(input: string) {
	const trimmed = input.trim();
	return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function toYoutubeEmbedUrl(input?: string | null): string | null {
	if (!input?.trim()) return null;

	try {
		const url = new URL(withProtocol(input));
		const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

		if (host === "youtu.be") {
			const id = url.pathname.split("/").filter(Boolean)[0];
			return id ? `https://www.youtube.com/embed/${id}` : null;
		}

		if (host === "youtube.com" || host === "youtube-nocookie.com") {
			const watchId = url.searchParams.get("v");
			if (watchId) return `https://www.youtube.com/embed/${watchId}`;

			const parts = url.pathname.split("/").filter(Boolean);
			const marker = parts.findIndex(
				(part) =>
					part === "embed" || part === "shorts" || part === "live",
			);
			const id = marker >= 0 ? parts[marker + 1] : undefined;
			return id ? `https://www.youtube.com/embed/${id}` : null;
		}

		return null;
	} catch {
		return null;
	}
}

export function youtubeThumbnail(input?: string | null): string | null {
	const embed = toYoutubeEmbedUrl(input);
	const id = embed?.split("/embed/")[1]?.split("?")[0];
	return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
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
	});
	if (video.hash) params.set("h", video.hash);
	return `https://player.vimeo.com/video/${video.id}?${params.toString()}`;
}

export function toVideoEmbedUrl(input?: string | null): string | null {
	return toVimeoEmbedUrl(input) ?? toYoutubeEmbedUrl(input);
}

type ThumbnailResource = {
	thumbnail?: string | null;
	thumbnail_id?: string | null;
	drive_file_id?: string | null;
	youtube_link?: string | null;
	vimeo_link?: string | null;
};

function isDirectImage(url?: string | null) {
	if (!url) return false;
	return (
		/vimeocdn\.com|img\.youtube\.com|googleusercontent\.com/i.test(url) ||
		/\.(jpg|jpeg|png|webp)(\?|$)/i.test(url)
	);
}

export function getResourceThumbnail(item: ThumbnailResource): string | null {
	if (isDirectImage(item.thumbnail)) return item.thumbnail!;
	if (item.thumbnail_id)
		return `https://drive.google.com/thumbnail?id=${item.thumbnail_id}`;
	if (item.drive_file_id)
		return `https://drive.google.com/thumbnail?id=${item.drive_file_id}`;
	if (item.youtube_link) return youtubeThumbnail(item.youtube_link);
	return null;
}

export function resourceSourceLabel(item: {
	file_type?: string;
	youtube_link?: string | null;
	vimeo_link?: string | null;
}) {
	if (item.file_type === "PDF") return "PDF Document";
	if (item.file_type === "Image") return "Image";
	if (item.vimeo_link) return "Vimeo";
	if (item.youtube_link) return "YouTube";
	return "Video";
}
