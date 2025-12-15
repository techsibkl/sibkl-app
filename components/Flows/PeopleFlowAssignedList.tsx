import { Flow } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { FlashList } from "@shopify/flash-list";
import React, { useState } from "react";
import { RefreshControl, View } from "react-native";
import SkeletonPeopleRow from "../shared/Skeleton/SkeletonPeopleRow";
import EmptyList from "./EmptyList";
import PeopleFlowRow from "./PeopleFlowRow";

type PeopleFlowAssignedListProps = {
	peopleFlow: PeopleFlow[];
	flows?: Flow[];
	selectedFlowId: number | null;
	onRefresh?: () => Promise<void>; // Add this prop
};

const PeopleFlowList = ({
	peopleFlow,
	flows,
	selectedFlowId,
	onRefresh,
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

	const [refreshing, setRefreshing] = useState(false);

	const handleRefresh = async () => {
		if (onRefresh) {
			setRefreshing(true);
			console.log("Refreshing people flow list...");
			await onRefresh();
			setRefreshing(false);
			console.log("Refresh complete.");
		}
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
				ListEmptyComponent={EmptyList}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						colors={["#3B82F6"]} // Android spinner color
						tintColor="#3B82F6" // iOS spinner color
					/>
				}
			/>
		</View>
	);
};

export default PeopleFlowList;
