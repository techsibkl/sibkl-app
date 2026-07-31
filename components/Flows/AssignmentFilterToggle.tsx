import { Role } from "@/utils/casl/defineAbilityFor";
import { ArrowLeftRight } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

export type AssignmentFilter = "district" | "cell" | "me" | null;

type FilterOption = { value: AssignmentFilter; label: string };

type Props = {
	value: AssignmentFilter;
	onChange: (v: AssignmentFilter) => void;
	roles?: string[];
};

const HIGH_PRIVILEGE_ROLES: Role[] = [
	Role.SUPER_ADMIN,
	Role.SENIOR_PASTOR,
	Role.PEOPLE_ADMIN,
	Role.STAFF,
	Role.DISTRICT_PASTOR,
	Role.DISTRICT_ADMIN,
	Role.CELL_ADMIN,
	Role.CELL_COORDINATOR,
];

const CELL_ROLES: Role[] = [Role.CELL_LEADER, Role.CELL_CORE];

const AssignmentFilterToggle = ({ value, onChange, roles = [] }: Props) => {
	const canSeeDistrict = roles.some((r) =>
		HIGH_PRIVILEGE_ROLES.includes(r as Role),
	);
	const canSeeCell =
		canSeeDistrict || roles.some((r) => CELL_ROLES.includes(r as Role));

	const options: FilterOption[] = [
		{ value: null, label: "-" },
		...(canSeeDistrict
			? [{ value: "district" as const, label: "My District" }]
			: []),
		...(canSeeCell ? [{ value: "cell" as const, label: "My Cell" }] : []),
		{ value: "me" as const, label: "Me" },
	];

	const currentIndex = options.findIndex((o) => o.value === value);
	const safeIndex = currentIndex === -1 ? 0 : currentIndex;
	const nextIndex = (safeIndex + 1) % options.length;
	const current = options[safeIndex];
	const next = options[nextIndex];

	return (
		<TouchableOpacity
			onPress={() => onChange(next.value)}
			activeOpacity={0.7}
			className={`flex-1 flex-row items-center gap-2 px-4 border ${value === null ? "border-border" : "border-blue-300"} rounded-[15px] bg-white`}
			style={{ height: 52 }}
		>
			<Text
				className={`flex-1 font-medium text-md ${value === null ? "text-blue-300" : "text-blue-500"}`}
				numberOfLines={1}
			>
				{current.label}
			</Text>
			<ArrowLeftRight size={13} color="#d1d5db" />
			<Text className="text-xs text-gray-400" numberOfLines={1}>
				{next.label}
			</Text>
		</TouchableOpacity>
	);
};

export default AssignmentFilterToggle;
