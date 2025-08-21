import { Cell } from "../Cell/cell.types";

export type District = {
  id?: number;
  name?: string;
  district_pastor_id?: number;
  district_pastor_name?: string;
  district_pastor_phone?: string;
  district_admin_id?: number;
  district_admin_name?: string;
  district_admin_phone?: string;
  description?: string;
  cells?: Cell[];
};
