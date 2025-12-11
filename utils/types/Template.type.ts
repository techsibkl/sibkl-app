export interface MyTemplate {
  id?: number; // Auto-increment ID (optional for inserts)
  district_id?: number | null;
  owner_id?: number | null;
  name: string; // Template alias name (REQUIRED)
  template: string; // Required
  created_at?: string; // Returned from DB
  updated_at?: string; // Returned from DB
}
