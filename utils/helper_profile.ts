import { defaultFlowStatusAttrs } from "@/constants/const_flows";
import { DEFAULT_PERSON_COLUMNS } from "@/constants/const_person";
import { Person } from "@/services/Person/person.type";
import { SectionEnum } from "@/types/TableField.type";
import { AgeGroup } from "./types/utils.types";

export const validatePerson = (person: Partial<Person>) => {
	const errors: { [key: string]: string } = {};

	// Validate only if the field exists in the Person type (some forms may not have all fields)
	if ("full_legal_name" in person) {
		if (!person.full_legal_name) {
			errors.full_legal_name = "Full Legal Name cannot be empty.";
		} else if (!/^[A-Za-z\s@\-]+$/.test(person.full_legal_name)) {
			errors.full_legal_name = "Full Legal Name has invalid characters.";
		} else if (person.full_legal_name.replace(/[\s@\-]+/g, "").length < 5) {
			errors.full_legal_name =
				"Full Legal Name must contain at least 5 alphabets.";
		} else if (
			/(.)\1{3,}/.test(person.full_legal_name.replace(/[\s@\-]/g, ""))
		) {
			errors.full_legal_name =
				"Full Legal Name cannot contain more than 4 consecutive identical letters.";
		}
	}

	// if ("first_name" in person) {
	// 	if (!person.first_name) {
	// 		errors.first_name = "First Name cannot be empty.";
	// 	} else if (!/^[A-Za-z\s]+$/.test(person.first_name)) {
	// 		errors.first_name = "First Name can only contain alphabets.";
	// 	}
	// }

	// if (!person.last_name) {
	//   errors.last_name = "Last Name cannot be empty.";
	// } else if (!/^[A-Za-z\s]+$/.test(person.last_name)) {
	//   errors.last_name = "Last Name can only contain alphabets.";
	// }

	if ("last_name" in person) {
		if (person.last_name && !/^[A-Za-z\s]+$/.test(person.last_name)) {
			errors.last_name = "Last Name can only contain alphabets.";
		}
	}

	if ("email" in person) {
		if (person.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email)) {
			errors.email = "A valid email is required.";
		}
	}

	if ("phone" in person) {
		if (!person.phone) {
			errors.phone = "Phone number cannot be empty";
		} else if (!/^\d{10,15}$/.test(person.phone)) {
			errors.phone = "A valid phone number is required.";
		}
	}

	if ("age" in person) {
		if (person.age! < 0) {
			errors.age = "Age cannot be less than 0";
		}
	}

	if ("postcode" in person) {
		if (person.postcode && !/^\d+$/.test(person.postcode)) {
			errors.postcode = "Postcode can only contain numbers.";
		}
	}

	if ("emergency_contact_name" in person) {
		if (
			person.emergency_contact_name &&
			!/^[A-Za-z\s]+$/.test(person.emergency_contact_name)
		) {
			errors.emergency_contact_name =
				"Emergency Contact Name can only contain alphabets.";
		}
	}
	if ("emergency_contact_phone" in person) {
		if (
			person.emergency_contact_phone &&
			!/^\d{10,15}$/.test(person.emergency_contact_phone)
		) {
			errors.emergency_contact_phone =
				"A valid Emergency Contact Phone is required.";
		}
	}

	return errors;
};

export const getAgeGroup = (age: number): AgeGroup | null => {
	if (age <= 12) return AgeGroup.AgeBelow13;
	if (age >= 13 && age <= 17) return AgeGroup.Age13_17;
	if (age >= 18 && age <= 23) return AgeGroup.Age18_23;
	if (age >= 24 && age <= 35) return AgeGroup.Age24_35;
	if (age >= 36 && age <= 45) return AgeGroup.Age36_45;
	if (age >= 46 && age <= 60) return AgeGroup.Age46_60;
	if (age > 60) return AgeGroup.AgeAbove60;
	return null;
};

// utils/formHelpers.ts

export const pickFieldsBySection = (
	person: Person,
	section: SectionEnum,
): Partial<Person> => {
	const sectionFields = DEFAULT_PERSON_COLUMNS.filter(
		(f) => f.section === section,
	).map((f) => f.key);

	return sectionFields.reduce((acc, key) => {
		if (key in person) {
			acc[key] = person[key];
		}
		return acc;
	}, {} as Partial<Person>);
};

export function getInitials(
	name?: string | null,
	fallback: string = "-",
): string {
	if (!name?.trim()) return fallback;

	// Remove non-alphanumeric characters, split by spaces, filter empty strings
	const words = name
		.split(/\s+/)
		.map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
		.filter(Boolean);

	if (words.length === 0) return fallback;

	const firstInitial = words[0]?.charAt(0) ?? "";
	const secondInitial = words[1]?.charAt(0) ?? "";

	return (firstInitial + secondInitial).toUpperCase() || fallback;
}

// Color-coded avatar with initials (same logic as row)
export const getAvatarColors = (status?: string) => {
	const COLOR_MAP: Record<string, { bg: string; text: string }> = {
		gray: { bg: "#f3f4f6", text: "#9ca3af" },
		purple: { bg: "#ede9fe", text: "#7c3aed" },
		green: { bg: "#dcfce7", text: "#16a34a" },
		red: { bg: "#fee2e2", text: "#dc2626" },
	};
	if (!status) return COLOR_MAP.gray;
	const color =
		defaultFlowStatusAttrs[status as keyof typeof defaultFlowStatusAttrs]
			?.color ?? "gray";
	return COLOR_MAP[color] ?? COLOR_MAP.gray;
};
