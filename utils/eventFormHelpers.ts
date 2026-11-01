import { EventCustomField } from "@/services/Event/event.type";
import { Person } from "@/services/Person/person.type";
import { getVisibleCustomFields } from "@/utils/eventCustomFields";
import { formatPhone } from "@/utils/helper";
import { toCalendarDateString } from "@/utils/localDate";

export function buildDefaultMetadata(
	fields: EventCustomField[] | undefined | null,
): Record<string, unknown> {
	const metadata: Record<string, unknown> = {};
	for (const field of getVisibleCustomFields(fields)) {
		if (field.type === "boolean") {
			metadata[field.key] = false;
		} else {
			metadata[field.key] = "";
		}
	}
	return metadata;
}

export function getPrefillContactFields(person: Person | undefined | null) {
	return {
		full_name:
			person?.full_legal_name?.trim() ||
			person?.preferred_name?.trim() ||
			"",
		email: person?.email?.trim() ?? "",
		phone: person?.phone?.trim() ?? "",
	};
}

export function buildRegistrationDefaultValues(
	person: Person | undefined | null,
	customFields: EventCustomField[] | undefined,
) {
	return {
		...getPrefillContactFields(person),
		metadata: buildDefaultMetadata(customFields),
	};
}

export function formatMetadataForSubmit(
	metadata: Record<string, unknown>,
	customFields: EventCustomField[],
): Record<string, unknown> {
	const visibleKeys = new Set(
		getVisibleCustomFields(customFields).map((f) => f.key),
	);
	const result: Record<string, unknown> = {};

	for (const field of getVisibleCustomFields(customFields)) {
		const value = metadata[field.key];
		if (value === undefined || value === null || value === "") {
			continue;
		}

		switch (field.type) {
			case "number": {
				const num = Number(value);
				if (!Number.isNaN(num)) result[field.key] = num;
				break;
			}
			case "date": {
				const formatted = toCalendarDateString(value);
				if (formatted) result[field.key] = formatted;
				break;
			}
			case "boolean":
				result[field.key] = Boolean(value);
				break;
			case "phone": {
				const formatted = formatPhone(String(value));
				if (formatted) result[field.key] = formatted;
				break;
			}
			default:
				result[field.key] = value;
		}
	}

	for (const key of Object.keys(result)) {
		if (!visibleKeys.has(key)) delete result[key];
	}

	return result;
}

export function formatEventDateTime(dateString?: string | null): string {
	if (!dateString) return "Date TBC";
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return "Date TBC";
	return date.toLocaleDateString("en-MY", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}
