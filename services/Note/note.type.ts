export type Note = {
  id: string; // UUID string (Primary Key)
  people_id: number; // Foreign key to people.id
  owner_id: number; // Foreign key to people.id
  note: string; // Text content of the note
  created_at?: Date; // Auto-generated timestamp
  updated_at?: Date; // Auto-updated timestamp
  district_ids: number[];
  owner_name: string;
};
