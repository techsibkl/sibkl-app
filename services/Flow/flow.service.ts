import { apiEndpoints } from "@/utils/endpoints";
import { dateReplacer, formatObjStrToDate } from "@/utils/helper";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";
import { Flow } from "./flow.types";
import { PeopleFlow } from "./peopleFlow.type";

export async function fetchFlows(
	flowIds?: number[],
	owned?: boolean,
): Promise<Flow[]> {
	const params = new URLSearchParams();

	if (owned !== undefined) params.append("owned", owned ? "true" : "false");
	if (flowIds && flowIds.length > 0) params.append("ids", flowIds.join(","));

	const response = await secureFetch(
		`${apiEndpoints.flows.getAll}?${params.toString()}`,
		{
			method: "GET",
		},
	);
	const json: ReturnVal = await response.json();
	const result = json.data?.map((flow: Flow) => ({
		...flow,
		steps: flow.steps ?? {},
	}));
	return result;
}

export async function fetchPeopleFlow(
	flowId?: number,
	assigneeId?: number,
	districtId?: number,
	status?: string,
): Promise<PeopleFlow[]> {
	// Fetch data from the server
	const payload = {
		flowId: flowId,
		districtId: districtId,
		status: status,
		assigneeId: assigneeId,
	};

	const response = await secureFetch(`${apiEndpoints.peopleFlows.getAll}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	const json = await response.json();
	const data = json.data as PeopleFlow[];
	return data.map((item: PeopleFlow) => formatObjStrToDate(item));

	// const data = json.data;
	// const result: PeopleFlow[] = data.map((item: PeopleFlow) => ({
	// 	...formatObjStrToDate(item),
	// 	p__f_cell_names: (item["p__cells"] as Cell[]).map(
	// 		(cell) => cell.cell_name,
	// 	),
	// 	p__f_district_names: (item["p__districts"] as District[]).map(
	// 		(district) => district.name,
	// 	),
	// }));
	// return json.data;
}

export const updatePeopleFlowSingleCustomAttr = async (
	flowId: number,
	person: PeopleFlow,
	key: string,
	value: string | number | Date,
	label: string,
): Promise<ReturnVal> => {
	const payload = {
		flowId: flowId,
		personId: person.p__id,
		personName: person.p__full_legal_name,
		key: key,
		value: value,
		label: label,
	};

	const response = await secureFetch(
		`${apiEndpoints.peopleFlows.updateCustomAttr}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload, dateReplacer),
		},
	);

	const data = await response.json();
	return data;
};
