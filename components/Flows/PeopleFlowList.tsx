import { Flow } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { View } from "react-native";
import PeopleFlowRow from "./PeopleFlowRow";

type PeopleFlowListProps = {
	peopleFlow: PeopleFlow[];
	flow: Flow;
};

const PeopleFlowList = ({ peopleFlow, flow }: PeopleFlowListProps) => {
	const renderItem = ({ item }: { item: PeopleFlow }) => (
		<PeopleFlowRow
			personFlow={item}
			steps={flow.steps}
			custom_attr={flow.custom_attr}
		/>
	);
	return (
		<View
			className="flex-row h-full mx-4 bg-white rounded-[15px] items-center justify-between"
			style={{
				shadowRadius: 5, // Override the default blur
				shadowOpacity: 0.05,
			}}
		>
			<FlashList
				data={peopleFlow}
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingVertical: 8,
				}}
				renderItem={renderItem}
			/>
		</View>
	);
};

export default PeopleFlowList;
