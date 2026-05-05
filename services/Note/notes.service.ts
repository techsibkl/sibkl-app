import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";
import { Note } from "./note.type";

export async function fetchNotes(id: number): Promise<Note[]> {
	const response = await secureFetch(
		`${apiEndpoints.notes.getByPeopleId(id)}`,
	);
	const json: ReturnVal = await response.json();

	const data = json.data
		?.map((item: any) => ({
			...item,
			created_at: new Date(item.created_at),
			updated_at: new Date(item.updated_at),
		}))
		.sort((a: any, b: any) => b.updated_at - a.updated_at);

	return data || [];
}

export async function updateNote(id: string, text: string): Promise<ReturnVal> {
	let payload = {
		id: id,
		note: text,
	};

	// Send the request to the server
	let response = await secureFetch(`${apiEndpoints.notes.update(id)}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
	let data = await response.json();
	return data;
}

export async function createNote(
	peopleId: number,
	note: string,
	districtIds?: number[],
): Promise<ReturnVal> {
	let payload = {
		people_id: peopleId,
		note: note,
		district_ids: districtIds,
	};

	// Send the request to the server
	let response = await secureFetch(`${apiEndpoints.notes.create}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
	let json = await response.json();
	return json;
}

export async function deleteNote(id: string): Promise<ReturnVal> {
	let payload = {
		id: id,
	};

	let response = await secureFetch(`${apiEndpoints.notes.delete(id)}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
	let data = await response.json();
	return data;
}
