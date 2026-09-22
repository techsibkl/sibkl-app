import { EventCustomField } from "@/services/Event/event.type";

export function sortCustomFields(
	fields: EventCustomField[] | undefined | null,
): EventCustomField[] {
	if (!fields?.length) return [];
	return [...fields].sort(
		(a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
	);
}

export function getVisibleCustomFields(
	fields: EventCustomField[] | undefined | null,
): EventCustomField[] {
	return sortCustomFields(fields).filter((field) => field.visible !== false);
}

export function toCustomFieldsArray(
	raw: EventCustomField[] | string | undefined | null,
): EventCustomField[] {
	if (!raw) return [];
	if (Array.isArray(raw)) return raw;
	if (typeof raw === "string") {
		try {
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}
	return [];
}

export function formatParticipantMetadataValue(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	return String(value);
}
