export type Announcement = {
	id: number;
	title: string;
	description: string;
	media: string;
	drive_file_id?: string;
	file_type?: "Image" | "Video" | "PDF";
	pinned: boolean;
	category: "LEADERS" | "STAFF" | "ALL";
	date_start?: Date;
	date_end?: Date;
	location?: string;
	cta_link?: string;
	updated_at?: Date;
	created_at?: Date;
};

export const ANNOUNCEMENTS_CATEGORY = ["LEADERS", "STAFF", "ALL"];
