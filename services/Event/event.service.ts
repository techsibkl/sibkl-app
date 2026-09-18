import {
	Event,
	EventParticipant,
	EventParticipantWritePayload,
	EventRegistration,
} from "@/services/Event/event.type";
import { apiEndpoints } from "@/utils/endpoints";
import { toCustomFieldsArray } from "@/utils/eventCustomFields";
import { normalizeParticipant } from "@/utils/normalizeParticipant";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";

function normalizeEvent(raw: Record<string, unknown>): Event {
	const get = (snake: string, camel: string) =>
		raw[snake] ?? raw[camel];

	const customFieldsRaw = get("custom_fields", "customFields");

	return {
		id: get("id", "id") as string | number,
		name: String(get("name", "name") ?? get("title", "title") ?? ""),
		description: get("description", "description") as string | undefined,
		venue: get("venue", "venue") as string | undefined,
		start_at: get("start_at", "startAt") as string | undefined,
		end_at: get("end_at", "endAt") as string | undefined,
		status: String(get("status", "status") ?? "draft"),
		allow_rsvp: Boolean(get("allow_rsvp", "allowRsvp")),
		rsvp_start_at: (get("rsvp_start_at", "rsvpStartAt") ?? null) as
			| string
			| null,
		rsvp_end_at: (get("rsvp_end_at", "rsvpEndAt") ?? null) as
			| string
			| null,
		allow_checkin:
			get("allow_checkin", "allowCheckin") === undefined
				? undefined
				: Boolean(get("allow_checkin", "allowCheckin")),
		custom_fields: toCustomFieldsArray(
			customFieldsRaw as Event["custom_fields"] | string,
		),
	};
}

function throwApiError(json: ReturnVal): never {
	throw {
		status: json.status_code,
		message: json.message ?? "Something went wrong. Please try again.",
		err_code: (json as ReturnVal & { err_code?: string }).err_code,
	};
}

export const fetchEvents = async (): Promise<Event[]> => {
	const response = await secureFetch(apiEndpoints.events.getAll);
	const json: ReturnVal = await response.json();

	if (!json.success) {
		throwApiError(json);
	}

	const data = json.data;
	if (!Array.isArray(data)) return [];
	return data.map((item) => normalizeEvent(item as Record<string, unknown>));
};

export const fetchEvent = async (eventId: string | number): Promise<Event> => {
	const response = await secureFetch(apiEndpoints.events.getById(eventId));
	const json: ReturnVal = await response.json();

	if (!json.success) {
		throwApiError(json);
	}

	return normalizeEvent(json.data as Record<string, unknown>);
};

export const registerEventParticipant = async (
	eventId: string | number,
	payload: EventParticipantWritePayload,
): Promise<EventParticipant> => {
	const response = await secureFetch(
		apiEndpoints.events.registerParticipant(eventId),
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		},
	);
	const json: ReturnVal = await response.json();

	if (!json.success) {
		throwApiError(json);
	}

	return normalizeParticipant(json.data as Record<string, unknown>);
};

function normalizeEventRegistration(
	raw: Record<string, unknown>,
  ): EventRegistration {
	const eventRaw =
	  (raw.event as Record<string, unknown> | undefined) ??
	  (raw.event_details as Record<string, unknown> | undefined);
  
	const participantRaw =
	  (raw.participant as Record<string, unknown> | undefined) ??
	  (raw.registration as Record<string, unknown> | undefined) ??
	  raw;
  
	if (!eventRaw) {
	  throw new Error("Invalid my-events payload: missing event");
	}
  
	return {
	  event: normalizeEvent(eventRaw),
	  participant: normalizeParticipant(
		participantRaw as Record<string, unknown>,
	  ),
	};
  }

export const fetchMyEventRegistrations = async (): Promise<EventRegistration[]> => {
	const response = await secureFetch(apiEndpoints.events.getMyEvents);
	const json: ReturnVal = await response.json();
	if (!json.success) {
		throwApiError(json);
	}
	const data = json.data;
	if (!Array.isArray(data)) {
		console.log("[MyEvents] API data is not an array", { data });
		return [];
	}
	const registrations = data.map((item) =>
		normalizeEventRegistration(item as Record<string, unknown>),
	);
	console.log("[MyEvents] API response normalized", {
		rawCount: data.length,
		registrations: registrations.map((r) => ({
			eventId: r.event.id,
			participantId: r.participant.id,
			checkedIn: r.participant.checked_in,
		})),
	});
	return registrations;
};

export const checkInEventParticipant = async (
	eventId: string | number,
	participantId: string | number,
): Promise<EventParticipant> => {
	const response = await secureFetch(
		apiEndpoints.events.checkInParticipant(eventId, participantId),
		{ method: "POST" },
	);
	const json: ReturnVal = await response.json();

	if (!json.success) {
		throwApiError(json);
	}

	return normalizeParticipant(json.data as Record<string, unknown>);
};
