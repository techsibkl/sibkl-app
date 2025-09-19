import { Person } from "../Person/person.type";

export interface AppUser {
  uid?: string;
  email: string;
  people_id: number;
  person: Person | null;
}
