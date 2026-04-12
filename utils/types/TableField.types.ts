export type TableField = {
	key: string;
	ori_key?: string;
	header: string;
	class: string;
	visible?: boolean;
	frozen?: boolean;
	editable?: boolean; // editable in profile? (false for formatted fields 'f_')
	type?: FieldTypeEnum;
	section?: SectionEnum;
	options?: (string | null | number)[];
};

export enum SectionEnum {
	PERSONAL_INFORMATION = "Personal Information",
	EMERGENCY_CONTACT = "Emergency Contact",
	CHURCH_DETAILS = "Church Details",
	MEMBERSHIP_DETAILS = "Membership Details",
	NONE = "NONE",
}

export enum FieldTypeEnum {
	TEXT = "text",
	SELECT = "select",
	DATE = "date",
	YEAR = "year",
}
