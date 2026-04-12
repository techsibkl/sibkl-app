import { Person } from "../Person/person.type";

// Helper type to prefix all Person properties with 'p__'
type PrefixedPerson = {
	[K in keyof Person as `p__${string & K}`]?: Person[K];
};

export interface PeopleFlow extends PrefixedPerson {
	people_id?: number; // Foreign key to people.id
	flow_id?: number; // Foreign key to flows.id
	assignee_id?: number; // Foreign key to people.id
	district_id?: number; // Foreign key to district.id
	assignee?: string; // Optional, person responsible for the flow
	remarks?: string; // Optional notes
	custom_attr?: Record<string, any>; // JSON object
	step_key?: string; // Current steps identifier (where the person is at)
	step_curr_label?: string; // Current step group label
	step_curr_key?: string; // Current step key
	status?:
		| "NEW"
		| "PENDING"
		| "IN PROGRESS"
		| "COMPLETED SUCCESS"
		| "COMPLETED FAIL"; // Current status of the person in the flow
	completed?: boolean; // Whether the person completed the flow
	last_contacted_by?: number; // Foreign key to people.id
	last_contacted_by_name?: string; // Name of the last contact person
	last_contacted?: Date; // Timestamp of last contact
	last_assigned_at?: Date; // Timestamp of last assignment
	created_at?: Date; // Timestamp of creation
	updated_at?: Date; // Timestamp of last update
}
