import {
	assignCellToFlow,
	assignDistrictToFlow,
	assignPersonToFlow,
} from "@/services/Flow/assign.service";
import { updateStep } from "@/services/Flow/flow.service";
import { FlowStep } from "@/services/Flow/flow.types";
import { myToast } from "@/utils/helper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export const useAssignMutation = (flowId: number) => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (payload: {
			people: Array<{ id: number; full_legal_name: string }>;
			flow?: { id: number; title?: string };
			assignee_id?: number;
			assigneeName?: string;
		}) => assignPersonToFlow(payload),
		onSuccess: (res, variables) => {
			qc.invalidateQueries({ queryKey: ["peopleFlow", flowId] });
			qc.invalidateQueries({ queryKey: ["peopleFlow", "all"] });
			if (variables.people) {
				variables.people.forEach((person) => {
					qc.invalidateQueries({
						queryKey: ["people", person.id],
					});
				});
			}
			Toast.show(myToast(res));
		},
	});
};

export const useAssignDistrictMutation = (flowId: number) => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (payload: {
			people: Array<{ id: number; full_legal_name: string }>;
			flow?: { id: number; title?: string };
			district?: { id: number; name: string };
		}) => assignDistrictToFlow(payload),
		onSuccess: (res, variables) => {
			qc.invalidateQueries({ queryKey: ["peopleFlow", flowId] });
			qc.invalidateQueries({ queryKey: ["peopleFlow", "all"] });
			if (variables.people) {
				variables.people.forEach((person) => {
					qc.invalidateQueries({ queryKey: ["people", person.id] });
				});
			}
			Toast.show(myToast(res));
		},
	});
};

export const useAssignCellMutation = (flowId: number) => {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (payload: {
			people: Array<{ id: number; full_legal_name: string }>;
			flow?: { id: number; title?: string };
			cell?: { id: number; cell_name?: string };
		}) => assignCellToFlow(payload),
		onSuccess: (res, variables) => {
			qc.invalidateQueries({ queryKey: ["peopleFlow", flowId] });
			qc.invalidateQueries({ queryKey: ["peopleFlow", "all"] });
			if (variables.people) {
				variables.people.forEach((person) => {
					qc.invalidateQueries({ queryKey: ["people", person.id] });
				});
			}
			Toast.show(myToast(res));
		},
	});
};

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
			qc.invalidateQueries({ queryKey: ["peopleFlow", variables?.flowId] });
			qc.invalidateQueries({ queryKey: ["peopleFlow", "all"] });
			variables?.peopleIds.forEach((id) => {
				qc.invalidateQueries({ queryKey: ["people", id] });
			});
			Toast.show(myToast(res));
		},
	});
};
