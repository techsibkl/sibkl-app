export type Notification = {
  id: number;
  people_id: number;
  title: string | null;
  body: string | null;
  type: "flow" | "people" | "cell" | "duplicate";
  ref_id: number | null;
  read_at: string | null; // ISO string (from DATETIME)
  closed_at: string | null; // ISO string (from DATETIME)
  created_at: string; // ISO string (from DATETIME)
};
