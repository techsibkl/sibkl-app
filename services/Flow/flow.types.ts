export enum FlowStatus {
	NOT_STARTED = "NOT STARTED",
	IN_PROGRESS = "IN PROGRESS",
	COMPLETED_SUCCESS = "COMPLETED SUCCESS",
	COMPLETED_FAIL = "COMPLETED FAIL",
}

export type StepAction =
	| { type: "CHANGE_FIELD"; source: string; value?: any; defaultValue?: any }
	| { type: "SEND_MESSAGE"; source: string; value?: any }
	| { type: "MOVE_TO_STEP"; source: string; value?: any }
	| { type: "MOVE_TO_FLOW"; source: string; value?: any };

export type Flow = {
	id: number;
	title: string;
	subtitle: string;
	custom_attr: { [key: string]: SingleCustomAttr };
	steps: { [key: string]: FlowStep };
	people_attr?: string[];
	status_labels?: Record<string, any>;
	template: string;
	// view_configs: ViewConfigs;
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
	require_signin?: boolean;
	enabled?: boolean;
	[key: string]: any;
};

export type FlowStep = {
	// key: string; // unique identifier within the flow (e.g. "attend_service")
	label: string; // display name, e.g. "Attend Service"
	description?: string; // optional helper text for UI
	criteria?: {
		key: string; // matches key in custom_attr
		operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "includes"; // flexible logic
		value: any; // target value to match
	}[];
	status?: FlowStatus; // default when criteria met
	sort_order: number; // display order
	actions?: StepAction[]; // optional actions to perform
};

export type SingleCustomAttr = {
	index?: number;
	label: string;
	type: string;
	show?: boolean;
	required?: boolean;
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
	RENAME,
}
