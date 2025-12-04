import { defaultPersonFields } from "@/constants/const_person";
import { Person } from "@/services/Person/person.type";
import { SectionEnum } from "@/types/TableField.type";
import { AgeGroup } from "./types/utils.types";

export const validatePerson = (person: Partial<Person>) => {
	const errors: { [key: string]: string } = {};

	// Validate only if the field exists in the Person type (some forms may not have all fields)
	if ("first_name" in person) {
		if (!person.first_name) {
			errors.first_name = "First Name cannot be empty.";
		} else if (!/^[A-Za-z\s]+$/.test(person.first_name)) {
			errors.first_name = "First Name can only contain alphabets.";
		}
	}

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

	// if (!person.date_of_visit) {
	//     errors.date_of_visit = 'Date of Visit cannot be empty.';
	// }

	// if (!person.address_line1) {
	//     errors.address_line1 = 'Address Line cannot be empty.';
	// }

	// if (!person.city) {
	//     errors.city = 'City cannot be empty.';
	// }

	// if (!person.state) {
	//     errors.state = 'State cannot be empty.';
	// }

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
	section: SectionEnum
): Partial<Person> => {
	const sectionFields = defaultPersonFields
		.filter((f) => f.section === section)
		.map((f) => f.key);

	return sectionFields.reduce((acc, key) => {
		if (key in person) {
			acc[key] = person[key];
		}
		return acc;
	}, {} as Partial<Person>);
};
