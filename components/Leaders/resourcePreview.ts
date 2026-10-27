import { MediaResource } from "@/services/Resource/resource.type";

const isPosterImage = (url?: string | null) => {
	if (!url) return false;
	return (
		/vimeocdn\.com|img\.youtube\.com|googleusercontent\.com/i.test(url) ||
		/\.(jpg|jpeg|png|webp)(\?|$)/i.test(url)
	);
};

export const getThumbnail = (item: MediaResource): string | null => {
	if (isPosterImage(item.thumbnail)) return item.thumbnail ?? null;
	if (item.thumbnail_id)
		return `https://drive.google.com/thumbnail?id=${item.thumbnail_id}`;
	if (item.drive_file_id)
		return `https://drive.google.com/thumbnail?id=${item.drive_file_id}`;
	if (item.youtube_link) {
		try {
			const u = new URL(item.youtube_link);
			const videoId =
				u.hostname === "youtu.be"
					? u.pathname.slice(1)
					: u.searchParams.get("v");
			if (videoId)
				return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
		} catch {
			return null;
		}
	}
	return null;
};
