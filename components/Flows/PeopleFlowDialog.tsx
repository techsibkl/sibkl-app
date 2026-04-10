import {
	ActionComponents,
	defaultFlowStatusAttrs,
} from "@/constants/const_flows";
import { FlowStep, SingleCustomAttr } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { daysAgo } from "@/utils/helper";
import {
	CircleDashedIcon,
	GitBranchIcon,
	PhoneIcon,
	UserIcon,
} from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type PeopleFlowDialogProps = {
	onDismiss: () => void;
	personFlow: PeopleFlow;
	step?: FlowStep | null;
	steps: { [key: string]: FlowStep };
	flow_id: number;
	flow_title?: string;
	assignee_name?: string;
	custom_attr?: { [key: string]: SingleCustomAttr };
	colors: { bg: string; text: string };
};

// Color-coded avatar with initials (same logic as row)
const getAvatarColors = (status?: string) => {
	const COLOR_MAP: Record<string, { bg: string; text: string }> = {
		gray: { bg: "#f3f4f6", text: "#9ca3af" },
		purple: { bg: "#ede9fe", text: "#7c3aed" },
		green: { bg: "#dcfce7", text: "#16a34a" },
		red: { bg: "#fee2e2", text: "#dc2626" },
	};
	if (!status) return COLOR_MAP.gray;
	const color =
		defaultFlowStatusAttrs[status as keyof typeof defaultFlowStatusAttrs]
			?.color ?? "gray";
	return COLOR_MAP[color] ?? COLOR_MAP.gray;
};

const getInitials = (name?: string) => {
	if (!name) return "?";
	const parts = name.trim().split(" ");
	if (parts.length === 1) return parts[0][0].toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const PeopleFlowDialog = ({
	onDismiss,
	personFlow,
	step,
	steps,
	flow_id,
	flow_title,
	assignee_name,
	custom_attr,
	colors,
}: PeopleFlowDialogProps) => {
	const avatarColors = getAvatarColors(personFlow.status);
	const initials = getInitials(personFlow.p__full_legal_name);
	const effectiveAssignee =
		assignee_name ?? personFlow.last_contacted_by_name ?? null;

	return (
		<View className="h-full w-full bg-white rounded-[15px] overflow-hidden">
			<ScrollView
				contentContainerStyle={{ paddingBottom: 20 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Status badge */}
				<View className="flex-col px-16 pt-6 gap-2">
					<View
						className="flex-row py-1.5 rounded-full items-center justify-center gap-2"
						style={{ backgroundColor: colors.bg }}
					>
						<CircleDashedIcon size={12} color={colors.text} />
						<Text
							className="font-semibold"
							style={{ color: colors.text }}
						>
							{step?.label ?? "Not Started"}
						</Text>
					</View>
					<Text
						className="text-gray-600 text-center text-sm"
						numberOfLines={4}
						ellipsizeMode="tail"
					>
						{step?.description ?? "No description available"}
					</Text>
				</View>

				{/* Avatar + name + phone */}
				<View className="mt-4 px-16 items-center gap-1">
					<View
						className="w-20 h-20 rounded-full items-center justify-center mb-1"
						style={{ backgroundColor: avatarColors.bg }}
					>
						<Text
							className="text-2xl font-bold"
							style={{ color: avatarColors.text }}
						>
							{initials}
						</Text>
					</View>
					<Text
						className="text-text text-xl font-bold"
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{personFlow.p__full_legal_name}
					</Text>
					<Text className="text-blue-600" numberOfLines={1}>
						{personFlow.p__phone ?? "-"}
					</Text>
				</View>

				{/* Compact meta info strip */}
				<View className="mx-6 mt-4 bg-gray-50 rounded-2xl px-4 py-3 gap-y-2">
					{flow_title && (
						<View className="flex-row items-center gap-2">
							<GitBranchIcon size={13} color="#9ca3af" />
							<Text
								className="text-xs text-gray-500 flex-1"
								numberOfLines={1}
							>
								{flow_title}
							</Text>
						</View>
					)}
					<View className="flex-row items-center gap-2">
						<UserIcon size={13} color="#9ca3af" />
						{effectiveAssignee ? (
							<Text
								className="text-xs text-gray-500 flex-1"
								numberOfLines={1}
							>
								{effectiveAssignee}
								{personFlow.last_assigned_at && (
									<Text className="text-gray-400 italic">
										{" · assigned "}
										{daysAgo(personFlow.last_assigned_at)}
									</Text>
								)}
							</Text>
						) : (
							<Text className="text-xs text-gray-400 italic">
								No assignee
							</Text>
						)}
					</View>
					<View className="flex-row items-center gap-2">
						<PhoneIcon size={13} color="#9ca3af" />
						{personFlow.last_contacted ? (
							<Text className="text-xs text-gray-500">
								Last contacted{" "}
								<Text className="italic">
									{daysAgo(personFlow.last_contacted)}
								</Text>
							</Text>
						) : (
							<Text className="text-xs text-gray-400 italic">
								No last contacted
							</Text>
						)}
					</View>
				</View>

				{/* Actions */}
				<View className="gap-y-2 flex flex-col w-full px-6 mt-5">
					{step?.actions?.map((action, i) => {
						const Component = ActionComponents[action.type];
						if (!Component) return null;
						return (
							<Component
								key={i}
								action={action}
								personFlow={personFlow}
								custom_attr={custom_attr}
								steps={steps}
								flow_id={flow_id}
							/>
						);
					})}
				</View>
			</ScrollView>

			{/* Back */}
			<TouchableOpacity
				className="w-full py-5 items-center justify-center border-t border-border"
				onPress={onDismiss}
			>
				<Text className="text-gray-500">Back</Text>
			</TouchableOpacity>
		</View>
	);
};

export default PeopleFlowDialog;
