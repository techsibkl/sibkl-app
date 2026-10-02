import { Event } from "@/services/Event/event.type";
import { isAfter, isBefore } from "date-fns";

function parseDate(value: string | null | undefined): Date | null {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

export function isEventPublished(event: Event): boolean {
	return event.status === "published";
}

/**
 * Whether the current time falls within the registration window
 * (`registration_open_at` → `registration_close_at`).
 * If neither bound is set, registration is always open (no window restriction).
 */
export function isRegistrationWindowOpen(
	event: Event,
	now: Date = new Date(Date.now()),
): boolean {
	const open = parseDate(event.registration_open_at ?? null);
	const close = parseDate(event.registration_close_at ?? null);
	const isAfterOpen = open ? isAfter(now, open) : true;
	const isBeforeClose = close ? isBefore(now, close) : true;
	return isAfterOpen && isBeforeClose;
}

/**
 * @deprecated Use `isRegistrationWindowOpen` for registration checks.
 * Kept for backward compatibility — checks the RSVP response window,
 * which is separate from when users can register.
 */
export function isWithinRsvpWindow(
	event: Event,
	now: Date = new Date(),
): boolean {
	if (!event.allow_rsvp) return true;
	const start = parseDate(event.rsvp_start_at ?? undefined);
	const end = parseDate(event.rsvp_end_at ?? undefined);
	if (start && now < start) return false;
	if (end && now > end) return false;
	return true;
}

/**
 * Whether a user can register for this event right now.
 * Requires: event published + RSVP allowed + within registration window.
 */
export function isEventRegisterable(
	event: Event,
	now: Date = new Date(Date.now()),
): boolean {
	if (!isEventPublished(event)) return false;
	return isRegistrationWindowOpen(event, now);
}

export function isEventCheckInOpen(event: Event): boolean {
	return isEventPublished(event) && event.allow_checkin !== false;
}

export function getRegistrationClosedMessage(event: Event): string {
	if (!isEventPublished(event)) {
		return "This event is not open for registration.";
	}
	if (!event.allow_rsvp) {
		return "Registration is not available for this event.";
	}
	const open = parseDate(event.registration_open_at ?? undefined);
	const close = parseDate(event.registration_close_at ?? undefined);
	const now = new Date();
	if (open && now < open) {
		return "Registration has not opened yet.";
	}
	if (close && now > close) {
		return "Registration for this event has closed.";
	}
	return "Registration is not available for this event.";
}
