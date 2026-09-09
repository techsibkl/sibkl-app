import { EventParticipant } from "@/services/Event/event.type";

export function toBool(value: unknown): boolean {
	if (value === true || value === 1) return true;
	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		return normalized === "1" || normalized === "true" || normalized === "yes";
	}
	return false;
}

function parseMetadata(raw: unknown): Record<string, unknown> {
	if (!raw) return {};
	if (typeof raw === "object" && !Array.isArray(raw)) {
		return raw as Record<string, unknown>;
	}
	if (typeof raw === "string") {
		try {
			const parsed = JSON.parse(raw);
			return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
				? (parsed as Record<string, unknown>)
				: {};
		} catch {
			return {};
		}
	}
	return {};
}

export function normalizeParticipant(raw: Record<string, unknown>): EventParticipant {
	const get = (snake: string, camel: string) =>
		raw[snake] ?? raw[camel];

	return {
		id: get("id", "id") as string | number | undefined,
		event_id: get("event_id", "eventId") as string | number | undefined,
		person_id:
			get("person_id", "personId") != null
				? String(get("person_id", "personId"))
				: undefined,
		full_name: String(get("full_name", "fullName") ?? ""),
		email: get("email", "email") as string | undefined,
		phone: get("phone", "phone") as string | undefined,
		invited: toBool(get("invited", "invited")),
		rsvp: toBool(get("rsvp", "rsvp")),
		checked_in: toBool(get("checked_in", "checkedIn")),
		metadata: parseMetadata(get("metadata", "metadata")),
	};
}
