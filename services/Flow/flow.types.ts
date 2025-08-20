// import type { ViewConfigs } from "./ViewConfigs";

export type Flow = {
  id: number;
  title: string;
  subtitle: string;
  custom_attr: { [key: string]: SingleCustomAttr };
  status_labels?: Record<string, any>;
  template: string;
//   view_configs: ViewConfigs;
  open_case?: string; // VARCHAR(255), Nullable
  close_case?: string; // VARCHAR(255), Nullable
  district_id?: number;
  num_total?: number;
  num: Record<string, number>;
  num_unassigned?: number;
  num_inprogress?: number;
  num_completed?: number;
  num_defaulted?: number;
  completed_attr_map: AttrMap[];
  [key: string]: any;
};

export type SingleCustomAttr = {
  index?: number;
  label: string;
  type: string;
  value: string | string[] | number | number[] | Date | Date[] | null;
  default_value: string | number | Date | null;
};

export type AttrMap = {
  from: string;
  to: string;
};

export enum ManageViewActions {
  CREATE,
  UPDATE,
  RENAME
}
