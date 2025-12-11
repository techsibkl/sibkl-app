export const displayDateAsStr = (
	value: string | Date | null | undefined,
	showYear: boolean = true
): string => {
	if (!value) return "-";

	// Skip numbers, only allow string and Date
	if (typeof value === "number") return String(value);
	if (typeof value === "string") {
		const str = String(value);
		if (
			/^[a-zA-Z]/.test(str) ||
			(!str.includes("-") && !str.includes("/"))
		) {
			return str;
		}
	}

	const date = new Date(value);
	// If it's a valid date
	if (!isNaN(date.getTime())) {
		return date.toLocaleDateString("en-MY", {
			day: "2-digit",
			month: "short",
			...(showYear && { year: "numeric" }), // Only include year if showYear is true
		});
	}

	return typeof value === "string" ? value : ""; // fallback for non-date strings
};

export function daysAgo(dateInput?: string | Date | null): string {
	if (!dateInput) return "-";

	const date = new Date(dateInput);
	if (isNaN(date.getTime())) return "-";

	const today = new Date();
	const diffTime = today.getTime() - date.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Yesterday";
	return `${diffDays} days ago`;
}

export function daysAgoTextColor(dateInput?: string | Date | null): string {
	if (!dateInput) return "text-gray-400";

	const date = new Date(dateInput);
	if (isNaN(date.getTime())) return "text-gray-400";

	const today = new Date();
	const diffTime = today.getTime() - date.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays <= 1) return "text-green-500";
	if (diffDays <= 30) return "text-yellow-500";
	if (diffDays <= 90) return "text-orange-500";
	return "text-red-500";
}

/**
 * Attempts to parse a string into a Date object based on known patterns.
 * Handles:
 * - Full ISO datetime strings (UTC): "2023-12-31T23:59:59.999Z"
 * - Date-only strings: "2023-12-31" (parsed as local date)
 */
export function formatObjStrToDate(obj: any): any {
	if (obj === null || obj === undefined) return obj;

	if (typeof obj === "string") {
		// ISO 8601 full datetime string (UTC) — "2023-12-31T23:59:59.999Z"
		if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(obj)) {
			return new Date(obj);
			// Date-only string — "2023-12-31"
		} else if (/^\d{4}-\d{2}-\d{2}$/.test(obj)) {
			return toLocalDate(obj);
		}
	}

	if (Array.isArray(obj)) {
		return obj.map(formatObjStrToDate);
	}

	if (typeof obj === "object") {
		const res: any = {};
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				res[key] = formatObjStrToDate(obj[key]);
			}
		}
		return res;
	}

	return obj;
}

/**
 Takes in API response's (date string) and calls Date() without assuming ori is UTC
 
 This replaces the use of usual Date()
*/
export function toLocalDate(str: string | null): Date | null {
	if (!str) return null;
	const datePart = str.split("T")[0];
	const [year, month, day] = datePart.split("-").map(Number);
	return new Date(year, month - 1, day);
}

/** Parsed into JSON.stringify(payload, dateReplacer) to preserve local datetime */
export const dateReplacer = function (
	this: Record<string, any>,
	key: string,
	value: any
) {
	if (this[key] instanceof Date) {
		const date: Date = this[key];
		if (isNaN(date.getTime())) return null;
		const y = date.getFullYear();
		const m = (date.getMonth() + 1).toString().padStart(2, "0");
		const d = date.getDate().toString().padStart(2, "0");
		return `${y}-${m}-${d}`; // format as 'YYYY-MM-DD'
	}
	return value;
};

export function formatPhone(phone?: string, defaultCountryCode = "60"): string {
	if (!phone) return "";
	// Remove all non-digit characters
	let digitsOnly = phone.replace(/[^0-9]/g, "");

	// If it already starts with a country code (e.g., 60, 65, etc.), return as is
	if (/^6\d{8,}$/.test(digitsOnly)) {
		return digitsOnly;
	}

	// If it starts with '0', remove it before adding the default country code
	if (digitsOnly.startsWith("0")) {
		digitsOnly = digitsOnly.slice(1);
	}

	// Prepend default country code
	return defaultCountryCode + digitsOnly;
}

export const featureNotReady = (toast: any) => {
	toast.add({
		severity: "info",
		summary: "Feature not ready",
		detail: "This feature is not available yet. Please contact the developer for more information.",
		life: 5000,
	});
};

// Used to compare different data types
export function powerEqual(a: any, b: any): boolean {
	const isDateA = a instanceof Date;
	const isDateB = b instanceof Date;

	if (isDateA && isDateB) {
		return a.getTime() === b.getTime();
	}

	return a === b;
}

export const formatDate = (dateString: string): string | null => {
	if (!dateString) return null;

	const parts = String(dateString).split(/[-\/]/);

	if (parts.length === 3) {
		let [part1, part2, part3] = parts.map(Number);

		if (part1 > 1900) {
			// Assume YYYY-MM-DD
			return `${part1}-${String(part2).padStart(2, "0")}-${String(part3).padStart(2, "0")}`;
		} else {
			// Assume DD-MM-YYYY or MM-DD-YYYY
			return `${part3}-${String(part2).padStart(2, "0")}-${String(part1).padStart(2, "0")}`;
		}
	}

	return null;
};
