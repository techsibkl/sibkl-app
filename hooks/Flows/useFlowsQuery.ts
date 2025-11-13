import { fetchPeopleByFlowId } from "@/services/Flow/flow.service";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { useQuery } from "@tanstack/react-query";

/**
 * @param flowId - The ID of the flow to fetch people for (fixed) cannot use `flow.value.id` because of possible undefined state
 * Reactive flow because need to wait for singleFlowQuery to resolve
 */
export const usePeopleFlowQuery = (flowId: number) => {
	return useQuery<PeopleFlow[]>({
		queryKey: ["peopleFlow", flowId],
		queryFn: () => fetchPeopleByFlowId(flowId),
		placeholderData: <PeopleFlow[]>[],
	});
};
