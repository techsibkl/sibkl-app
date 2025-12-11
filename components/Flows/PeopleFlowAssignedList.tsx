import { Flow } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { View } from "react-native";
import SkeletonPeopleRow from "../shared/Skeleton/SkeletonPeopleRow";
import PeopleFlowRow from "./PeopleFlowRow";

type PeopleFlowAssignedListProps = {
	peopleFlow: PeopleFlow[];
	flows?: Flow[];
	selectedFlowId: number | null;
};

const PeopleFlowList = ({
	peopleFlow,
	flows,
	selectedFlowId,
}: PeopleFlowAssignedListProps) => {
	// If selectedFlowId exists, meaning single flow
	const selectedFlow = flows?.find((f) => f.id == selectedFlowId);
	const renderItem = ({ item }: { item: PeopleFlow }) => {
		const flow = selectedFlow ?? flows?.find((f) => f.id == item.flow_id);
		return (
			(flow && (
				<PeopleFlowRow
					personFlow={item}
					steps={flow.steps}
					custom_attr={flow.custom_attr}
				/>
			)) || <SkeletonPeopleRow />
		);
	};
	return (
		<View
			className="flex-1 flex-row mx-4 bg-white rounded-t-[15px] items-center justify-between"
			style={{
				shadowRadius: 5, // Override the default blur
				shadowOpacity: 0.05,
			}}
		>
			<FlashList
				data={peopleFlow}
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingVertical: 16,
				}}
				renderItem={renderItem}
				ListEmptyComponent={SkeletonPeopleRow}
			/>
		</View>
	);
};

export default PeopleFlowList;
