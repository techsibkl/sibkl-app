import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";

export async function createNote(
	peopleId: number,
	note: string,
	districtIds?: number[]
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
