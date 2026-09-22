import { Event } from "@/services/Event/event.type";

function parseDate(value: string | null | undefined): Date | null {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

export function isEventPublished(event: Event): boolean {
	return event.status === "published";
}

export function isWithinRsvpWindow(event: Event, now: Date = new Date()): boolean {
	if (!event.allow_rsvp) return true;

	const start = parseDate(event.rsvp_start_at ?? undefined);
	const end = parseDate(event.rsvp_end_at ?? undefined);

	if (start && now < start) return false;
	if (end && now > end) return false;
	return true;
}

export function isEventRegisterable(
	event: Event,
	now: Date = new Date(),
): boolean {
	return isEventPublished(event) && isWithinRsvpWindow(event, now);
}

export function isEventCheckInOpen(event: Event): boolean {
	return isEventPublished(event) && event.allow_checkin !== false;
}

export function getRegistrationClosedMessage(event: Event): string {
	if (!isEventPublished(event)) {
		return "This event is not open for registration.";
	}
	if (event.allow_rsvp) {
		const start = parseDate(event.rsvp_start_at ?? undefined);
		const end = parseDate(event.rsvp_end_at ?? undefined);
		const now = new Date();
		if (start && now < start) {
			return "Registration has not opened yet.";
		}
		if (end && now > end) {
			return "Registration for this event has closed.";
		}
	}
	return "Registration is not available for this event.";
}
