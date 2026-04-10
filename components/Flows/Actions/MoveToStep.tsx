import { defaultFlowStatusAttrs } from "@/constants/const_flows";
import { useChangeStepMutation } from "@/hooks/Flows/usePeopleFlowMutations";

import { FlowStatus, FlowStep, StepAction } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import {
	ChevronDownIcon,
	ChevronUpIcon,
	CircleDashedIcon,
	StepForwardIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type Props = {
	action: StepAction;
	personFlow: PeopleFlow;
	steps: { [key: string]: FlowStep };
	flow_id: number;
};

// Tailwind color name → hex for RN (mirrors defaultFlowStatusAttrs colors)
const COLOR_HEX: Record<string, { text: string; bg: string; border: string }> =
	{
		gray: { text: "#6b7280", bg: "#f3f4f6", border: "#d1d5db" },
		purple: { text: "#7c3aed", bg: "#ede9fe", border: "#c4b5fd" },
		green: { text: "#16a34a", bg: "#dcfce7", border: "#86efac" },
		red: { text: "#dc2626", bg: "#fee2e2", border: "#fca5a5" },
	};

type StepOption = {
	key: string | null;
	label: string;
	status: FlowStatus;
	color: string;
};

const buildGroupedSteps = (steps: {
	[key: string]: FlowStep;
}): StepOption[][] => {
	const grouped: Record<FlowStatus, StepOption[]> = {
		[FlowStatus.IRRELEVANT]: [],
		[FlowStatus.NOT_STARTED]: [],
		[FlowStatus.IN_PROGRESS]: [],
		[FlowStatus.COMPLETED_SUCCESS]: [],
		[FlowStatus.COMPLETED_FAIL]: [],
	};

	// Virtual "Not Started" entry (null key = reset to beginning)
	grouped[FlowStatus.NOT_STARTED].push({
		key: null,
		label: "Not Started",
		status: FlowStatus.NOT_STARTED,
		color: defaultFlowStatusAttrs[FlowStatus.NOT_STARTED]?.color ?? "gray",
	});

	Object.entries(steps)
		.sort(([, a], [, b]) => a.sort_order - b.sort_order)
		.forEach(([key, step]) => {
			const status =
				(step.status as FlowStatus) ?? FlowStatus.NOT_STARTED;
			const color = defaultFlowStatusAttrs[status]?.color ?? "gray";
			grouped[status]?.push({ key, label: step.label, status, color });
		});

	return Object.values(grouped).filter((g) => g.length > 0);
};

const MoveToStepAction = ({ action, personFlow, steps, flow_id }: Props) => {
	const [open, setOpen] = useState(false);
	const { mutate: changeStep, isPending } = useChangeStepMutation();

	const suggestedStep = action.value ? steps[action.value as string] : null;
	const currentStep = personFlow.step_key ? steps[personFlow.step_key] : null;
	const groupedSteps = buildGroupedSteps(steps);

	const handleSelect = (option: StepOption) => {
		// Skip if already on this step
		const isSameStep = option.key === (personFlow.step_key ?? null);
		if (isSameStep) {
			setOpen(false);
			return;
		}

		const targetStep = option.key
			? steps[option.key]
			: {
					label: "Not Started",
					sort_order: -9999,
					status: FlowStatus.NOT_STARTED,
				};

		changeStep({
			flowId: flow_id,
			peopleIds: [personFlow.people_id!],
			step_key: option.key,
			step: targetStep as FlowStep,
			districtId: personFlow.district_id,
		});
		setOpen(false);
	};

	return (
		<View>
			{/* Main row */}
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={() => setOpen((prev) => !prev)}
				className="flex-row items-center gap-3 bg-white p-4 rounded-xl border border-border"
			>
				<View className="p-2 rounded-full bg-purple-100">
					<StepForwardIcon size={18} color="#512da8" />
				</View>

				<View className="flex-1">
					<Text className="text-gray-800 font-semibold">
						Move to step
					</Text>
					<Text className="text-gray-500 text-sm mt-0.5">
						{suggestedStep ? (
							<>
								Suggested:{" "}
								<Text className="font-medium text-gray-700">
									{suggestedStep.label}
								</Text>
							</>
						) : (
							"Select a step"
						)}
					</Text>
					{currentStep && (
						<Text className="text-gray-400 text-xs mt-0.5">
							Current: {currentStep.label}
						</Text>
					)}
				</View>

				{isPending ? (
					<ActivityIndicator size="small" color="#9ca3af" />
				) : open ? (
					<ChevronUpIcon size={16} color="#9ca3af" />
				) : (
					<ChevronDownIcon size={16} color="#9ca3af" />
				)}
			</TouchableOpacity>

			{/* Inline dropdown */}
			{open && (
				<View className="mt-1 bg-white border border-border rounded-xl overflow-hidden">
					{groupedSteps.map((group, gi) => (
						<View key={gi}>
							{/* Group divider (except first) */}
							{gi > 0 && (
								<View className="h-px bg-gray-100 mx-3" />
							)}

							{group.map((option) => {
								const hex =
									COLOR_HEX[option.color] ?? COLOR_HEX.gray;
								const isCurrentStep =
									option.key ===
									(personFlow.step_key ?? null);
								const isSuggested = option.key === action.value;

								return (
									<TouchableOpacity
										key={option.key ?? "__not_started"}
										onPress={() => handleSelect(option)}
										activeOpacity={0.7}
										className="flex-row items-center gap-3 px-4 py-3"
										style={
											isCurrentStep
												? { backgroundColor: hex.bg }
												: undefined
										}
									>
										{/* Status dot */}
										<View
											className="w-6 h-6 rounded-full items-center justify-center"
											style={{ backgroundColor: hex.bg }}
										>
											<CircleDashedIcon
												size={13}
												color={hex.text}
											/>
										</View>

										<Text
											className="flex-1 text-sm font-medium"
											style={{
												color: isCurrentStep
													? hex.text
													: "#374151",
											}}
										>
											{option.label}
										</Text>

										{/* Badges */}
										<View className="flex-row gap-1.5 items-center">
											{isSuggested && (
												<View
													className="px-2 py-0.5 rounded-full"
													style={{
														backgroundColor: hex.bg,
													}}
												>
													<Text
														className="text-[10px] font-semibold"
														style={{
															color: hex.text,
														}}
													>
														Suggested
													</Text>
												</View>
											)}
											{isCurrentStep && (
												<View className="px-2 py-0.5 rounded-full bg-gray-100">
													<Text className="text-[10px] font-semibold text-gray-400">
														Current
													</Text>
												</View>
											)}
										</View>
									</TouchableOpacity>
								);
							})}
						</View>
					))}
				</View>
			)}
		</View>
	);
};

export default MoveToStepAction;
