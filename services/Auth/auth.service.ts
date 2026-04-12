import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";
import { Person } from "../Person/person.type";

export const createAccount = async (
	profileData: Partial<Person>
): Promise<ReturnVal> => {
	const response = await secureFetch(`${apiEndpoints.users.createAccount}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(profileData),
	});
	const json: ReturnVal = await response.json();
	return json;
};

export const getPersonOfUid = async () => {
	const response = await secureFetch(apiEndpoints.users.getPersonOfUid, {
		method: "GET",
	});
	const json: ReturnVal = await response.json();
	return json;
};
