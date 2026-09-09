import { EventRegistrationFormValues } from "@/services/Event/event.type";

export type EventRegistrationValidationErrors = Partial<
	Record<keyof EventRegistrationFormValues | "submit", string>
>;

export function validateEventRegistrationForm(
	values: EventRegistrationFormValues,
): EventRegistrationValidationErrors {
	const errors: EventRegistrationValidationErrors = {};
	const fullName = values.full_name?.trim() ?? "";

	if (!fullName) {
		errors.full_name = "Full name is required.";
	}

	const email = values.email?.trim() ?? "";
	if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errors.email = "Please enter a valid email address.";
	}

	return errors;
}

export function hasValidationErrors(
	errors: EventRegistrationValidationErrors,
): boolean {
	return Object.keys(errors).length > 0;
}
