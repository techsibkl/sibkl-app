export type MediaResource = {
  id: string; // unique identifier in your DB
  title: string; // custom resource title
  description?: string; // summary/notes
  category: string; // e.g. "discipleship", "policies"
  tags?: string[]; // searchable keywords
  file_type: "Video" | "PDF" | "Image"; // derived from mimeType
  drive_file_id: string; // returned by Drive API
  drive_view_link: string; // https://drive.google.com/file/d/{id}/view
  drive_download_link: string; // https://drive.google.com/uc?export=download&id={id}
  thumbnail_id: string | null;
  thumbnail?: string; // from Drive API (`thumbnailLink`)
  upload_date: string; // stored when uploaded
  created_by?: string; // original author (optional)
  uploaded_by: string; // admin user ID/email
  file_size: string;
  uploaded_by_name: string;
  // size_in_bytes?: number; // from Drive API
  // duration_seconds?: number; // (if Video/audio, can query later)
  is_featured?: boolean; // highlight certain resources
};
