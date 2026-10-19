type ClaimContact = {
	email?: string | null;
	phone?: string | null;
};

export type ClaimConfidence = "high" | "email" | "none";

/** Masked claim rows still keep a real local-part and domain when an email exists. */
function hasCompleteEmail(email?: string | null): boolean {
	const value = email?.trim() ?? "";
	if (!value || !value.includes("@")) return false;
	const [localPart, domain] = value.split("@");
	return Boolean(localPart && domain?.includes("."));
}

/** A masked phone keeps the first and last digits; 8+ digits means a full number was stored. */
function hasCompletePhone(phone?: string | null): boolean {
	const digits = (phone ?? "").replace(/\D/g, "");
	return digits.length >= 8;
}

export function claimConfidence(person: ClaimContact): ClaimConfidence {
	const email = hasCompleteEmail(person.email);
	const phone = hasCompletePhone(person.phone);
	if (email && phone) return "high";
	if (email) return "email";
	return "none";
}

export function claimConfidenceRank(person: ClaimContact): number {
	const level = claimConfidence(person);
	if (level === "high") return 2;
	if (level === "email") return 1;
	return 0;
}
