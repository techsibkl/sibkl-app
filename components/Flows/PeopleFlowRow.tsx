import { defaultFlowStatusAttrs } from "@/constants/const_flows";
import {
	FlowStatus,
	FlowStep,
	SingleCustomAttr,
} from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { daysAgo } from "@/utils/helper";
import {
	daysAgoTextColorNative,
	getStepStatusStyleNative,
} from "@/utils/helper_flows";
import { getInitials } from "@/utils/helper_profile";
import {
	ChevronRightIcon,
	CircleDashedIcon,
	FunnelIcon,
	UserIcon,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AddNoteDialog from "../Notes/NotesDialog";
import SharedModal from "../shared/SharedModal";
import PeopleFlowDialog from "./PeopleFlowDialog";

type PeopleFlowRowProps = {
	personFlow: PeopleFlow;
	flow_title?: string;
	steps: { [key: string]: FlowStep };
	custom_attr: { [key: string]: SingleCustomAttr };
};

// Map defaultFlowStatusAttrs color strings → avatar bg/icon hex values
const STATUS_AVATAR_COLORS: Record<string, { bg: string; icon: string }> = {
	gray: { bg: "#f3f4f6", icon: "#9ca3af" },
	purple: { bg: "#ede9fe", icon: "#7c3aed" },
	green: { bg: "#dcfce7", icon: "#16a34a" },
	red: { bg: "#fee2e2", icon: "#dc2626" },
};

const getAvatarColors = (status?: FlowStatus) => {
	if (!status) return STATUS_AVATAR_COLORS.gray;
	const color = defaultFlowStatusAttrs[status]?.color ?? "gray";
	return STATUS_AVATAR_COLORS[color] ?? STATUS_AVATAR_COLORS.gray;
};

const PeopleFlowRowComponent = ({
	personFlow,
	flow_title,
	steps,
	custom_attr,
}: PeopleFlowRowProps) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [noteDialogVisible, setNoteDialogVisible] = useState(false);

	const _step = useMemo(() => {
		const key = personFlow.step_key ?? "not_started";
		return steps?.[key] ?? null;
	}, [personFlow.step_key, steps]);

	const colors = getStepStatusStyleNative(personFlow.step_key, steps);
	const avatarColors = getAvatarColors(personFlow.status);
	const initials = getInitials(personFlow.p__full_legal_name);
	const effectiveAssignee =
		personFlow.assignee_name ??
		personFlow.last_contacted_by_name ??
		undefined;

	return (
		<>
			<TouchableOpacity
				onPress={() => setModalVisible(true)}
				activeOpacity={0.6}
			>
				<View className="flex-col py-4 border-b border-border-secondary">
					{/* Top row: status badge + last contacted */}
					<View className="flex-row justify-between items-center mb-3">
						<View
							className="px-3 py-1.5 rounded-full flex-row items-center gap-1 self-start"
							style={{ backgroundColor: colors.bg }}
						>
							<CircleDashedIcon size={12} color={colors.text} />
							<Text
								className="text-xs font-semibold"
								style={{ color: colors.text }}
							>
								{_step?.label ?? "Not Started"}
							</Text>
						</View>

						{personFlow.last_contacted && (
							<Text
								className="text-xs font-medium italic"
								style={{
									color: daysAgoTextColorNative(
										personFlow.last_contacted,
									),
								}}
							>
								{daysAgo(personFlow.last_contacted)}
							</Text>
						)}
					</View>

					{/* Main row: avatar + info + chevron */}
					<View className="flex-row items-center gap-x-3">
						{/* Color-coded avatar with initials */}
						<View
							className="w-11 h-11 rounded-full items-center justify-center"
							style={{ backgroundColor: avatarColors.bg }}
						>
							<Text
								className="text-sm font-bold"
								style={{ color: avatarColors.icon }}
							>
								{initials}
							</Text>
						</View>

						{/* Name, phone, flow source, assignee */}
						<View className="flex-1 gap-y-0.5">
							<Text
								className="text-text font-semibold"
								numberOfLines={1}
							>
								{personFlow.p__full_legal_name}
							</Text>
							<Text
								className="text-text-secondary text-sm"
								numberOfLines={1}
							>
								{personFlow.p__phone ?? "-"}
							</Text>

							{/* Flow source */}
							{flow_title && (
								<View className="flex-row items-center gap-x-1 flex-wrap">
									<FunnelIcon size={10} color="#9ca3af" />
									<Text
										className="text-xs text-gray-400 mt-0.5"
										numberOfLines={1}
									>
										{flow_title}
									</Text>
								</View>
							)}

							{/* Assignee + last assigned */}
							{(effectiveAssignee ||
								personFlow.last_assigned_at) && (
								<View className="flex-row items-center gap-x-1 flex-wrap">
									{effectiveAssignee && (
										<>
											<UserIcon
												size={10}
												color="#9ca3af"
											/>
											<Text
												className="text-xs text-gray-400"
												numberOfLines={1}
											>
												{effectiveAssignee}
											</Text>
										</>
									)}
									{effectiveAssignee &&
										personFlow.last_assigned_at && (
											<Text className="text-xs text-gray-300">
												·
											</Text>
										)}
									{personFlow.last_assigned_at && (
										<Text className="text-xs text-gray-400 italic">
											assigned{" "}
											{daysAgo(
												personFlow.last_assigned_at,
											)}
										</Text>
									)}
								</View>
							)}
						</View>

						{/* Chevron — signals tappability */}
						<ChevronRightIcon
							size={16}
							color="#d1d5db"
							strokeWidth={2}
						/>
					</View>
				</View>
			</TouchableOpacity>

			<SharedModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			>
				<PeopleFlowDialog
					onDismiss={() => setModalVisible(false)}
					personFlow={personFlow}
					assignee_name={effectiveAssignee}
					step={_step}
					steps={steps}
					flow_id={personFlow.flow_id!}
					custom_attr={custom_attr}
					colors={colors}
				/>
			</SharedModal>

			<SharedModal
				visible={noteDialogVisible}
				onClose={() => setNoteDialogVisible(false)}
			>
				<AddNoteDialog
					onDismiss={() => setNoteDialogVisible(false)}
					personFlow={personFlow}
				/>
			</SharedModal>
		</>
	);
};

const PeopleFlowRow = React.memo(PeopleFlowRowComponent);
export default PeopleFlowRow;
