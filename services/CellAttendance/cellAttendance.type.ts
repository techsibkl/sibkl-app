export type CellSessionStatus = "open" | "closed";

export type CellSession = {
  id: number;
  cell_id: number;
  meeting_date: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  attendee_count: number;
  member_count?: number;
  guest_count?: number;
  total_members: number;
  status?: CellSessionStatus;
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

export type CellAttendanceStat = {
  cell_id: number;
  people_id: number;
  full_legal_name: string;
  sessions_attended: number;
  total_sessions: number;
  attendance_rate: number;
};