export type EventCustomFieldType =
	| "text"
	| "number"
	| "email"
	| "phone"
	| "date"
	| "boolean"
	| "select";

export interface EventCustomField {
	key: string;
	label: string;
	type: EventCustomFieldType;
	options?: string[];
	display_order: number;
	visible: boolean;
}

export type EventStatus = "draft" | "published" | "cancelled" | string;

export interface Event {
	id: string | number;
	name: string;
	description?: string;
	venue?: string;
	start_at?: string;
	end_at?: string;
	status: EventStatus;
	allow_rsvp?: boolean;
	rsvp_start_at?: string | null;
	rsvp_end_at?: string | null;
	custom_fields?: EventCustomField[];
}

export interface EventParticipant {
	id?: string | number;
	event_id?: string | number;
	person_id?: string;
	full_name: string;
	email?: string;
	phone?: string;
	invited?: boolean;
	rsvp?: boolean;
	checked_in?: boolean;
	metadata?: Record<string, unknown>;
	remarks?: string;
}

export type EventParticipantWritePayload = {
	full_name: string;
	person_id?: string;
	email?: string;
	phone?: string;
	invited?: boolean;
	rsvp?: boolean;
	checked_in?: boolean;
	metadata?: Record<string, unknown>;
	remarks?: string;
};

/** Stable backend error code when user is already registered for an event */
export const PARTICIPANT_ALREADY_REGISTERED = "PARTICIPANT_ALREADY_REGISTERED";

export type EventRegistrationFormValues = {
	full_name: string;
	email: string;
	phone: string;
	metadata: Record<string, unknown>;
};
