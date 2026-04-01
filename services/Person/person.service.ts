import { apiEndpoints } from "@/utils/endpoints";
import { dateReplacer, formatObjStrToDate } from "@/utils/helper";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";
import { Cell } from "../Cell/cell.types";
import { District } from "../District/district.types";
import { MaskedPerson, Person } from "./person.type";

export const fetchPeople = async (): Promise<Person[]> => {
	// Fetch data from the server
	let url = `${apiEndpoints.people.getAll}`;
	let response = await secureFetch(url);
	let json: ReturnVal = await response.json();
	if (!json.success) {
		throw {
			status: json.status_code,
			message: json.message,
		};
	}
	return json.data as Person[];
};

export async function fetchPersonById(id: number): Promise<Person> {
	// Fetch data for a single person by ID
	let response = await secureFetch(`${apiEndpoints.people.getById(id)}`);
	let json: ReturnVal = await response.json();
	if (!json.success) {
		throw {
			status: json.status_code,
			message: json.message,
		};
	}
	const item = json.data?.[0];
	const formattedItem = {
		...formatObjStrToDate(item),
		f_cell_names: (item["cells"] as Cell[]).map((cell) => cell.cell_name),
		f_district_names: (item["districts"] as District[]).map(
			(district) => district.name,
		),
	};
	return formattedItem as Person;
}

export async function fetchPeopleScopedFields(): Promise<Person[]> {
	let response = await secureFetch(`${apiEndpoints.people.getScoped}`);
	let json: ReturnVal = await response.json();
	if (!json.success) {
		throw {
			status: json.status_code,
			message: json.message,
		};
	}

	return json.data as Person[];
}

export const fetchPeopleWithNoUid = async (): Promise<
	MaskedPerson[] | null
> => {
	// Fetch data from the server
	try {
		let response = await secureFetch(
			apiEndpoints.people.geteWithNoUid,
			{ method: "GET" },
			{ allowUnauthenticated: true },
		);
		let json: ReturnVal = await response.json();
		if (!json.success) {
			throw {
				status: json.status_code,
				message: json.message,
			};
		}

		return json?.data as MaskedPerson[];
	} catch (error) {
		console.error(error);
		return null;
	}
};

export const updatePeople = async (
	person: Partial<Person>,
): Promise<ReturnVal> => {
	let response = await secureFetch(
		`${apiEndpoints.people.update(person.id!)}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(person, dateReplacer),
		},
	);

	let data = await response.json();
	return data;
};
