export type MediaResource = {
	id?: number; // optional while creating
	title: string;
	description?: string;
	category: string;
	tags?: string[];
	file_type: "Video" | "PDF" | "Image";
	drive_file_id?: string;
	drive_view_link?: string;
	drive_download_link?: string;
	thumbnail_id?: string | null;
	thumbnail?: string;
	upload_date?: string;
	created_by?: string;
	uploaded_by?: string;
	uploaded_by_name?: string;
	file_size?: string;
	is_featured?: boolean;
	role_group_ids?: number[];
	// NEW
	youtube_video_id?: string;
	youtube_url?: string;
	upload_to_youtube?: boolean;
	youtube_link?: string;
};
