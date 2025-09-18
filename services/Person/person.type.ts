import { AgeGroup } from "@/utils/types/utils.types";
import { Flow } from "../Flow/flow.types";
import { Cell } from "../Cell/cell.types";
import { Note } from "../Note/note.type";

export type Person = {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  birth_date: Date | null;
  gender: string;
  occupation: string;
  created_at: string;
  phone: string;
  date_of_visit: Date | null;
  attendance_percent: number;
  regular_service: string;
  age: number;
  age_group: AgeGroup | null;
  address_line1: string;
  town: string;
  city: string;
  state: string;
  postcode: string;
  marital_status: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  is_christian: string;
  flows: Flow[];
  year_accetpted_christ: number | null;
  date_baptised: Date | null;
  is_baptised: string;
  baptised_in_sibkl : string;
  baptism_cert_number: string;
  date_dna_session: Date | null;
  date_membership: Date | null;
  member_id: string;
  notes?: Note[]; // Relationship: A person can have multiple notes
  roles: string[];
  cells: Cell[];
  cell_ids: number[];
  district_ids: number[];
  pastor_district_ids: number[];
  admin_district_ids: number[];
  flow_assignee_ids?: number[];
  // uid?: string;
  [key: string]: any;
};

export type maskedPerson = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
}