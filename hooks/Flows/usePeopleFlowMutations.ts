import { updateStep } from "@/services/Flow/flow.service";
import { FlowStep } from "@/services/Flow/flow.types";
import { myToast } from "@/utils/helper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

// export const useAssignMutation = (flow?: Flow) => {
//   const peopleStore = usePeopleStore();
//   const qc = useQueryClient();

//   return useMutation({
//     mutationFn: (payload: { people: Person[]; flow?: Flow; assignee_id?: number; assigneeName?: string }) =>
//       peopleStore.assign(payload),
//     onSuccess: (_, variables) => {
//       qc.invalidateQueries({ queryKey: ["peopleFlow", variables.flow?.id] });
//     }
//   });
// };

// export const useAssignDistrictMutation = (flow?: Flow) => {
//   const peopleStore = usePeopleStore();
//   const qc = useQueryClient();

//   return useMutation({
//     mutationFn: (payload: { people: Person[]; flow?: Flow; district?: District }) =>
//       peopleStore.assignDistrict(payload),
//     onSuccess: (_, variables) => {
//       qc.invalidateQueries({ queryKey: ["peopleFlow", variables.flow?.id] });
//     }
//   });
// };

// /**
//  * Deprecated, use `useChangeStatusMutation` instead
//  */
// export const useCompleteMutation = () => {
//   const peopleStore = usePeopleStore();

//   return useMutation({
//     mutationFn: (payload: { flowId: number; peopleIds: number[]; completedAttrMap: AttrMap[] }) =>
//       peopleStore.completePeopleInFlow(payload.flowId, payload.peopleIds, payload.completedAttrMap)
//   });
// };

export const useChangeStepMutation = () => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (payload: {
			flowId: number;
			peopleIds: number[];
			step_key: string | null;
			step: FlowStep;
			districtId?: number;
		}) =>
			updateStep(
				payload.flowId,
				payload.peopleIds,
				payload.step_key,
				payload.step,
				payload.districtId,
			),
		onSuccess: (res, variables) => {
			// Targeted: only invalidate this flow + the "all flows" assigned-to-me list
			qc.invalidateQueries({ queryKey: ["peopleFlow", variables?.flowId] });
			qc.invalidateQueries({ queryKey: ["peopleFlow", "all"] });
			variables?.peopleIds.forEach((id) => {
				qc.invalidateQueries({ queryKey: ["people", id] });
			});
			Toast.show(myToast(res));
		},
	});
};

// export const useAddPeopleToFlowMutation = () => {
//   const peopleStore = usePeopleStore();

//   return useMutation({
//     mutationFn: (payload: { flowId: number; districtId: number; peopleIds: number[] }) =>
//       peopleStore.addPeopleToFlow(payload.flowId, payload.districtId, payload.peopleIds)
//   });
// };

// export const useImportPersonToFlowMutation = (flowId: number, completed: boolean) => {
//   const peopleStore = usePeopleStore();
//   const qc = useQueryClient();

//   return useMutation({
//     mutationFn: (payload: { processedData: any; flowId: number }) => peopleStore.importPeopleToFlow(payload),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["peopleFlow", flowId] });
//     }
//   });
// };
