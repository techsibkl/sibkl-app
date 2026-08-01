import { Flow } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { FlashList } from "@shopify/flash-list";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { RefreshControl, Text, TouchableOpacity, View } from "react-native";
import SkeletonList from "../shared/Skeleton/SkeletonList";
import SkeletonPeopleRow from "../shared/Skeleton/SkeletonPeopleRow";
import EmptyList from "./EmptyList";
import PeopleFlowRow from "./PeopleFlowRow";

export type FlowListItem =
	| { kind: "header"; title: string; sectionKey: string }
	| { kind: "row"; data: PeopleFlow };

type PeopleFlowAssignedListProps = {
	listData: FlowListItem[];
	flows?: Flow[];
	selectedFlowId: number | null;
	onRefresh?: () => Promise<void>;
	isPending?: boolean;
};

type SectionHeaderProps = {
	title: string;
	sectionKey: string;
	isExpanded: boolean;
	onToggle: (key: string) => void;
};

const SectionHeader = ({
	title,
	sectionKey,
	isExpanded,
	onToggle,
}: SectionHeaderProps) => (
	<TouchableOpacity
		onPress={() => onToggle(sectionKey)}
		activeOpacity={0.7}
		className="mt-0 px-6 py-4 bg-gray-100 flex-row items-center justify-between"
	>
		<Text className="text-xs font-bold uppercase tracking-wider text-gray-700 flex-1">
			{title}
		</Text>
		{isExpanded ? (
			<ChevronUpIcon size={16} color="#4b5563" />
		) : (
			<ChevronDownIcon size={16} color="#4b5563" />
		)}
	</TouchableOpacity>
);

const PeopleFlowList = ({
	listData,
	flows,
	selectedFlowId,
	onRefresh,
	isPending,
}: PeopleFlowAssignedListProps) => {
	const selectedFlow = flows?.find((f) => f.id == selectedFlowId);
	const [expandedSections, setExpandedSections] = useState<
		Record<string, boolean>
	>({});

	const toggleSection = (sectionKey: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[sectionKey]: !prev[sectionKey],
		}));
	};

	// Filter list based on expanded sections
	const filteredListData = useMemo(() => {
		const result: FlowListItem[] = [];
		let currentSectionKey: string | null = null;

		for (const item of listData) {
			if (item.kind === "header") {
				currentSectionKey = item.sectionKey;
				result.push(item);
				// Mark this section as expanded by default if not explicitly set
				if (!(item.sectionKey in expandedSections)) {
					expandedSections[item.sectionKey] = true;
				}
			} else if (
				currentSectionKey &&
				expandedSections[currentSectionKey] !== false
			) {
				result.push(item);
			}
		}
		return result;
	}, [listData, expandedSections]);

	const renderItem = ({ item }: { item: FlowListItem }) => {
		if (item.kind === "header") {
			const isExpanded = expandedSections[item.sectionKey] !== false;
			return (
				<SectionHeader
					title={item.title}
					sectionKey={item.sectionKey}
					isExpanded={isExpanded}
					onToggle={toggleSection}
				/>
			);
		}

		const pf = item.data;
		const flow = selectedFlow ?? flows?.find((f) => f.id == pf.flow_id);
		return (
			(flow && (
				<PeopleFlowRow
					personFlow={pf}
					flow_title={selectedFlowId == 0 ? flow.title : undefined}
					steps={flow.steps}
					custom_attr={flow.custom_attr}
				/>
			)) || <SkeletonPeopleRow />
		);
	};

	const [refreshing, setRefreshing] = useState(false);

	const handleRefresh = async () => {
		if (onRefresh) {
			setRefreshing(true);
			await onRefresh();
			setRefreshing(false);
		}
	};

	return (
		<View
			className="flex-1 flex-row mx-4 bg-white rounded-t-[15px] items-center justify-between"
			style={{ shadowRadius: 5, shadowOpacity: 0.05 }}
		>
			<FlashList
				data={filteredListData}
				contentContainerStyle={{
					paddingBottom: 16,
				}}
				renderItem={renderItem}
				getItemType={(item) => item.kind}
				estimatedItemSize={80}
				ListEmptyComponent={
					(isPending && <SkeletonList length={20} />) || <EmptyList />
				}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						colors={["#3B82F6"]}
						tintColor="#3B82F6"
					/>
				}
				stickyHeaderIndices={filteredListData
					.map((item, idx) => (item.kind === "header" ? idx : -1))
					.filter((idx) => idx >= 0)}
			/>
		</View>
	);
};

export default PeopleFlowList;
