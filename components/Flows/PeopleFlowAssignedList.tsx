import { Flow } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { FlashList } from "@shopify/flash-list";
import React, { useState } from "react";
import { RefreshControl, Text, View } from "react-native";
import SkeletonList from "../shared/Skeleton/SkeletonList";
import SkeletonPeopleRow from "../shared/Skeleton/SkeletonPeopleRow";
import EmptyList from "./EmptyList";
import PeopleFlowRow from "./PeopleFlowRow";

export type FlowListItem =
	| { kind: "header"; title: string }
	| { kind: "row"; data: PeopleFlow };

type PeopleFlowAssignedListProps = {
	listData: FlowListItem[];
	flows?: Flow[];
	selectedFlowId: number | null;
	onRefresh?: () => Promise<void>;
	isPending?: boolean;
};

const SectionHeader = ({ title }: { title: string }) => (
	<View className="mt-0 px-6 py-4 bg-gray-100">
		<Text className="text-xs font-bold uppercase tracking-wider text-gray-700">
			{title}
		</Text>
	</View>
);

const PeopleFlowList = ({
	listData,
	flows,
	selectedFlowId,
	onRefresh,
	isPending,
}: PeopleFlowAssignedListProps) => {
	const selectedFlow = flows?.find((f) => f.id == selectedFlowId);

	const renderItem = ({ item }: { item: FlowListItem }) => {
		if (item.kind === "header") {
			return <SectionHeader title={item.title} />;
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
				data={listData}
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
			/>
		</View>
	);
};

export default PeopleFlowList;
