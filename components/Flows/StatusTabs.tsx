import { defaultFlowStatusAttrs } from "@/constants/const_flows";
import { FlowStatus } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// Map the color strings from defaultFlowStatusAttrs to Tailwind classes
const COLOR_MAP: Record<string, { active: string; badge: string }> = {
	gray: { active: "bg-gray-400", badge: "bg-gray-300" },
	purple: { active: "bg-purple-500", badge: "bg-purple-400" },
	green: { active: "bg-green-500", badge: "bg-green-400" },
	red: { active: "bg-red-400", badge: "bg-red-300" },
	blue: { active: "bg-blue-500", badge: "bg-blue-400" },
};

const TABS: { label: string; status: FlowStatus | null }[] = [
	{ label: "All", status: null },
	...Object.entries(defaultFlowStatusAttrs)
		.filter(([status]) => status !== FlowStatus.IRRELEVANT)
		.map(([status, attrs]) => ({
			label: attrs.label,
			status: status as FlowStatus,
		})),
];

type Props = {
	peopleFlow: PeopleFlow[];
	selectedStatus: FlowStatus | null;
	onSelect: (status: FlowStatus | null) => void;
};

const FlowStatusTabs = ({ peopleFlow, selectedStatus, onSelect }: Props) => {
	const countFor = (status: FlowStatus | null) =>
		status === null
			? peopleFlow.length
			: peopleFlow.filter((p) => p.status === status).length;

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{
				paddingHorizontal: 16,
				paddingVertical: 8,
				gap: 8,
			}}
			className="flex-grow-0"
		>
			{TABS.map(({ label, status }) => {
				const isActive = selectedStatus === status;
				const attrColor =
					status === null
						? "blue"
						: (defaultFlowStatusAttrs[status]?.color ?? "gray");
				const colors = COLOR_MAP[attrColor] ?? COLOR_MAP.gray;
				const count = countFor(status);

				return (
					<TouchableOpacity
						key={label}
						onPress={() => onSelect(status)}
						activeOpacity={0.75}
						className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
							isActive
								? `${colors.active} border-transparent`
								: "bg-white border-gray-200"
						}`}
					>
						<Text
							className={`text-xs font-semibold ${
								isActive ? "text-white" : "text-gray-600"
							}`}
						>
							{label}
						</Text>

						<View
							className={`rounded-full px-1.5 py-0.5 min-w-[20px] items-center ${
								isActive ? colors.badge : "bg-gray-100"
							}`}
						>
							<Text
								className={`text-[10px] font-bold ${
									isActive ? "text-white" : "text-gray-500"
								}`}
							>
								{count}
							</Text>
						</View>
					</TouchableOpacity>
				);
			})}
		</ScrollView>
	);
};

export default FlowStatusTabs;
