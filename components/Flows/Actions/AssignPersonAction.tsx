import HelpDialog from "@/components/shared/HelpDialog";
import SharedModal from "@/components/shared/SharedModal";
import { useAssignMutation } from "@/hooks/Flows/usePeopleFlowMutations";
import { StepAction } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { fetchPeoplePaginated } from "@/services/Person/person.service";
import { Person } from "@/services/Person/person.type";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, HelpCircle, UserRoundCheck } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import AssignPersonDialog from "../Assign/AssignPersonDialog";

type Props = {
	action: StepAction;
	personFlow: PeopleFlow;
	flow_id: number;
	onSuccess?: () => void;
};

const AssignPersonAction = ({ personFlow, flow_id, onSuccess }: Props) => {
	const [dialogVisible, setDialogVisible] = useState(false);
	const [helpVisible, setHelpVisible] = useState(false);

	const { mutate: assignPerson, isPending } = useAssignMutation(flow_id);

	const { data: paginatedResponse } = useQuery({
		queryKey: ["people_paginated"],
		queryFn: () => fetchPeoplePaginated({ pageSize: 500 }),
		staleTime: 5 * 60 * 1000,
	});
	const people = useMemo(
		() => paginatedResponse?.data ?? [],
		[paginatedResponse],
	);

	const currentAssignee = useMemo(
		() =>
			people.find((p: Person) => p.id === personFlow.assignee_id) ?? null,
		[people, personFlow.assignee_id],
	);

	const handleAssign = (person: Person) => {
		assignPerson(
			{
				people: [
					{
						id: Number(personFlow.p__id),
						full_legal_name: personFlow.p__full_legal_name ?? "",
					},
				],
				flow: { id: flow_id },
				assignee_id: person.id,
				assigneeName: person.full_legal_name ?? "",
			},
			{ onSuccess: () => onSuccess?.() },
		);
	};

	return (
		<View>
			<View className="flex-row items-center gap-2">
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => setDialogVisible(true)}
					className="flex-1 flex-row items-center gap-3 bg-white p-4 rounded-xl border border-border"
				>
					<View className="p-2 rounded-full bg-green-100">
						<UserRoundCheck size={18} color="#15803d" />
					</View>

					<View className="flex-1 gap-0.5">
						<View className="flex-row items-center">
							<Text className="text-gray-800 font-bold">
								Assign Follow-Up Person
							</Text>
							<Pressable
								onPress={() => setHelpVisible(true)}
								className="p-2"
							>
								<HelpCircle size={16} color="#9ca3af" />
							</Pressable>
						</View>
						<Text
							className="text-xs text-gray-400"
							numberOfLines={1}
						>
							{personFlow.assignee_name
								? `Currently: ${personFlow.assignee_name}`
								: "No assignee yet"}
						</Text>
					</View>

					{isPending ? (
						<ActivityIndicator size="small" color="#9ca3af" />
					) : (
						<ArrowRight size={18} />
					)}
				</TouchableOpacity>
			</View>

			<AssignPersonDialog
				visible={dialogVisible}
				onDismiss={() => setDialogVisible(false)}
				onAssign={handleAssign}
				people={people}
				currentAssignee={currentAssignee}
				priorityCellId={personFlow.assigned_cell_id}
				priorityDistrictId={personFlow.district_id}
			/>

			<SharedModal
				visible={helpVisible}
				onClose={() => setHelpVisible(false)}
			>
				<HelpDialog
					title="Assign Follow-Up Person"
					description="Select a person to be responsible for following up with this individual. The assignee will see them in their 'Assigned to Me' list."
				/>
			</SharedModal>
		</View>
	);
};

export default AssignPersonAction;
