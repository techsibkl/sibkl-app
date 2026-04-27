export type CellSession = {
  id: number;
  cell_id: number;
  meeting_date: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  attendee_count: number;
  total_members: number;
};

export type CellSessionAttendee = {
  id: number;
  people_id: number | null;
  guest_name: string | null;
  guest_phone: string | null;
  is_present: number;
  checked_in_at: string;
  invited_by_id: number | null;
};

export type CellSessionDetail = CellSession & {
  attendees: CellSessionAttendee[];
};