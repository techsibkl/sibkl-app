import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";

export interface AssignPersonPayload {
	people: Array<{
		id: number;
		full_legal_name: string;
	}>;
	flow?: {
		id: number;
		title?: string;
	};
	assignee_id?: number;
	assigneeName?: string;
}

export interface AssignDistrictPayload {
	people: Array<{
		id: number;
		full_legal_name: string;
	}>;
	flow?: {
		id: number;
		title?: string;
	};
	district?: {
		id: number;
		name: string;
	};
}

export const assignPersonToFlow = async (
	payload: AssignPersonPayload,
): Promise<ReturnVal> => {
	const response = await secureFetch(`${apiEndpoints.assign?.person}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	return response.json();
};

export const assignDistrictToFlow = async (
	payload: AssignDistrictPayload,
): Promise<ReturnVal> => {
	const response = await secureFetch(`${apiEndpoints.assign?.district}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	return response.json();
};
