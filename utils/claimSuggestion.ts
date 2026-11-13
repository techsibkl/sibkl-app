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

/**
 * Whether claim-by-SMS can be offered.
 * sendSmsOTP looks the number up by person id. A masked claim row such as
 * "60*******89" still means a phone is on file. hasCompletePhone (8+ digits)
 * is only for suggestion ranking.
 */
export function hasClaimPhone(phone?: string | null): boolean {
	const value = phone?.trim() ?? "";
	if (!value) return false;
	const digits = value.replace(/\D/g, "");
	if (digits.length >= 7) return true;
	return digits.length > 0 && /[^0-9\s+()-]/.test(value);
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
