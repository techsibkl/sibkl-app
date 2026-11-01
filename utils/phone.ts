export const DEFAULT_DIAL_CODE = "60";

export type PhoneCountry = {
	name: string;
	dialCode: string;
};

/** One entry per dial code. Longer codes are matched before shorter ones. */
export const PHONE_COUNTRIES: PhoneCountry[] = [
	{ name: "Malaysia", dialCode: "60" },
	{ name: "Singapore", dialCode: "65" },
	{ name: "Indonesia", dialCode: "62" },
	{ name: "Brunei", dialCode: "673" },
	{ name: "Thailand", dialCode: "66" },
	{ name: "Philippines", dialCode: "63" },
	{ name: "Vietnam", dialCode: "84" },
	{ name: "Cambodia", dialCode: "855" },
	{ name: "Laos", dialCode: "856" },
	{ name: "Myanmar", dialCode: "95" },
	{ name: "China", dialCode: "86" },
	{ name: "Hong Kong", dialCode: "852" },
	{ name: "Macau", dialCode: "853" },
	{ name: "Taiwan", dialCode: "886" },
	{ name: "Japan", dialCode: "81" },
	{ name: "South Korea", dialCode: "82" },
	{ name: "India", dialCode: "91" },
	{ name: "Pakistan", dialCode: "92" },
	{ name: "Bangladesh", dialCode: "880" },
	{ name: "Sri Lanka", dialCode: "94" },
	{ name: "Nepal", dialCode: "977" },
	{ name: "Australia", dialCode: "61" },
	{ name: "New Zealand", dialCode: "64" },
	{ name: "United Kingdom", dialCode: "44" },
	{ name: "Ireland", dialCode: "353" },
	{ name: "United States / Canada", dialCode: "1" },
	{ name: "United Arab Emirates", dialCode: "971" },
	{ name: "Saudi Arabia", dialCode: "966" },
	{ name: "Qatar", dialCode: "974" },
	{ name: "Kuwait", dialCode: "965" },
	{ name: "Bahrain", dialCode: "973" },
	{ name: "Oman", dialCode: "968" },
	{ name: "Germany", dialCode: "49" },
	{ name: "France", dialCode: "33" },
	{ name: "Netherlands", dialCode: "31" },
	{ name: "Italy", dialCode: "39" },
	{ name: "Spain", dialCode: "34" },
	{ name: "Switzerland", dialCode: "41" },
	{ name: "Sweden", dialCode: "46" },
	{ name: "Norway", dialCode: "47" },
	{ name: "Denmark", dialCode: "45" },
	{ name: "Finland", dialCode: "358" },
	{ name: "Belgium", dialCode: "32" },
	{ name: "Austria", dialCode: "43" },
	{ name: "Portugal", dialCode: "351" },
	{ name: "Poland", dialCode: "48" },
	{ name: "Greece", dialCode: "30" },
	{ name: "Turkey", dialCode: "90" },
	{ name: "Russia", dialCode: "7" },
	{ name: "Ukraine", dialCode: "380" },
	{ name: "South Africa", dialCode: "27" },
	{ name: "Nigeria", dialCode: "234" },
	{ name: "Kenya", dialCode: "254" },
	{ name: "Egypt", dialCode: "20" },
	{ name: "Brazil", dialCode: "55" },
	{ name: "Mexico", dialCode: "52" },
	{ name: "Argentina", dialCode: "54" },
];

const DIAL_CODES_BY_LENGTH = [
	...new Set(PHONE_COUNTRIES.map((country) => country.dialCode)),
].sort((a, b) => b.length - a.length);

export function digitsOnly(phone?: string | null): string {
	return (phone ?? "").replace(/\D/g, "");
}

/**
 * National length required before a single-digit dial code is trusted.
 * Malaysian mobiles are 9–10 digits and start with 1, so a bare "1…" must
 * not be read as +1 unless a full NANP national number follows.
 */
const SINGLE_DIGIT_NATIONAL_LENGTH: Record<string, number> = {
	"1": 10,
	"7": 10,
};

/** Longest known dial code at the start of an already-international digit string. */
export function matchDialCode(digits: string): string | null {
	if (!digits) return null;
	for (const code of DIAL_CODES_BY_LENGTH) {
		if (!digits.startsWith(code) || digits.length <= code.length) continue;
		const requiredNational = SINGLE_DIGIT_NATIONAL_LENGTH[code];
		if (
			requiredNational != null &&
			digits.length - code.length !== requiredNational
		) {
			continue;
		}
		return code;
	}
	return null;
}

export function splitPhone(phone?: string | null): {
	dialCode: string;
	national: string;
} {
	const digits = digitsOnly(phone);
	if (!digits) {
		return { dialCode: DEFAULT_DIAL_CODE, national: "" };
	}

	const dialCode = matchDialCode(digits);
	if (dialCode) {
		return { dialCode, national: digits.slice(dialCode.length) };
	}

	return {
		dialCode: DEFAULT_DIAL_CODE,
		national: digits.replace(/^0+/, ""),
	};
}

/** Dial code + national digits, with a local trunk 0 removed. Empty if there is no national number. */
export function joinPhone(dialCode: string, national: string): string {
	const code = digitsOnly(dialCode) || DEFAULT_DIAL_CODE;
	const local = digitsOnly(national).replace(/^0+/, "");
	if (!local) return "";
	return code + local;
}

/**
 * Stored shape: digits only, country code included, no leading 0.
 * Numbers that already start with a known dial code are left unchanged.
 * A local Malaysian mobile such as 123456789 does not count — dial code 1
 * only matches a full 11-digit NANP number.
 */
export function toInternationalDigits(
	phone?: string | null,
	defaultCountryCode = DEFAULT_DIAL_CODE,
): string {
	if (!phone) return "";
	const digits = digitsOnly(phone);
	if (!digits) return "";
	if (matchDialCode(digits)) return digits;
	const local = digits.replace(/^0+/, "");
	if (!local) return "";
	return `${defaultCountryCode}${local}`;
}

/**
 * If the user pastes a full international number into the national box,
 * split it back into a dial code and a national number.
 * Short local numbers (including Malaysian mobiles that start with 1) stay as typed.
 */
export function parsePastedPhone(
	raw: string,
): { dialCode: string; national: string } | null {
	const trimmed = raw.trim();
	const hasIntlPrefix = trimmed.startsWith("+") || trimmed.startsWith("00");
	const digits = digitsOnly(
		trimmed.startsWith("00") ? trimmed.slice(2) : trimmed,
	);
	const dialCode = matchDialCode(digits);
	if (!dialCode) return null;

	const national = digits.slice(dialCode.length);
	if (national.length < 6) return null;
	if (hasIntlPrefix) return { dialCode, national };
	if (dialCode.length >= 2 && digits.length >= 10 && digits.length <= 15) {
		return { dialCode, national };
	}
	return null;
}
