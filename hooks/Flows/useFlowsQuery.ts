import { fetchFlows, fetchPeopleFlow } from "@/services/Flow/flow.service";
import { Flow } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { useQuery } from "@tanstack/react-query";

export const useFlowsQuery = (flow_ids?: number[], owned?: boolean) => {
	return useQuery<Flow[]>({
		queryKey: ["flows", flow_ids, owned ?? false],
		queryFn: () => fetchFlows(flow_ids, owned),
	});
};

export const useSingleFlowQuery = (flowId?: number) => {
	return useQuery<Flow>({
		queryKey: ["flows", flowId],
		queryFn: async () => {
			const res = await fetchFlows([flowId!]);
			return res[0];
		},
		retry: (failureCount, error: any) => {
			if (error?.status === 401 || error?.status === 403) {
				return false;
			}
			return failureCount < 3;
		},
		placeholderData: <Flow>{},
		enabled: !!flowId,
	});
};

/**
 * @param flowId - The ID of the flow to fetch people for (fixed) cannot use `flow.value.id` because of possible undefined state
 * Reactive flow because need to wait for singleFlowQuery to resolve
 */
export const usePeopleFlowQuery = (flowId?: number, assigneeId?: number) => {
	return useQuery<PeopleFlow[]>({
		queryKey: [
			"peopleFlow",
			flowId ?? "all",
			"assignee",
			assigneeId ?? "none",
		],

		queryFn: () => fetchPeopleFlow(flowId, assigneeId),
		placeholderData: <PeopleFlow[]>[],
		enabled: !!flowId || !!assigneeId,
	});
};
