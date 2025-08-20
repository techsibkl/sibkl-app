import { AgeGroup } from "@/utils/types/utils.types";
import { Person } from "../Person/person.type";

export type Cell = {
  id?: number;
  cell_name?: string;
  cell_description?: string;
  age_start?: number | null;
  age_end?: number | null;
  age_range?: string | null;
  age_group?: AgeGroup;
  address?: string;
  cell_leader_1?: number | null;
  cell_leader_2?: number | null;
  meeting_day?: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  meeting_time?: string;
  f_meeting_time?: string | null;
  frequency?: string | null;
  recurrence_type?: "Weekly" | "Biweekly" | "Monthly";
  specific_weeks?: string;
  cell_character?: string;
  status?: CellStatus;
  cell_leader_1_name?: string | null;
  cell_leader_1_phone?: string | null;
  cell_leader_2_name?: string | null;
  cell_leader_2_phone?: string | null;
  members?: Person[];
  has_changes?: number;
  lat?: number | null;
  lng?: number | null;
  district_id?: number;
  district_name?: string;
  district_pastor_id?: number;
  district_pastor_name?:string | null;
  district_pastor_phone?:string | null;
  district_admin_id?: number;
  district_admin_name?: string | null;
  district_admin_phone?: string | null;
  zone_id?: number | null;
  zone_name?: string | null;
  zone_f_name?: string | null;
  zone_leader_1?: number | null;
  zone_leader_2?: number | null;
  zone_leader_1_name?: string | null;
  zone_leader_1_phone?: string | null;
  zone_leader_2_name?: string | null;
  zone_leader_2_phone?: string | null;
  level?: string | null;
};

export enum CellStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DELETED = "DELETED"
}

