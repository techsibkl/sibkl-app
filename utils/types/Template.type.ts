export type TemplateChannel = "TEXT" | "EMAIL";

export type MyTemplate = {
	id?: number; // Auto-increment ID (optional for inserts)
	district_id?: number | null;
	owner_id?: number | null;
	name: string; // Template alias name (REQUIRED)
	subject?: string | null; // Optional for TEXT templates
	body: string; // Required
	channel: TemplateChannel; // Required
	created_at?: string; // Returned from DB
	updated_at?: string; // Returned from DB
};
