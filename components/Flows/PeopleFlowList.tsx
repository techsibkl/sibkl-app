import { Person } from "@/services/Person/person.type";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { View } from "react-native";
import PeopleRow from "../People/PeopleRow";

type PeopleFlowListProps = {
	peopleFlow: Person[];
};

const PeopleFlowList = ({ peopleFlow: notifications }: PeopleFlowListProps) => {
	const renderItem = ({ item }: { item: Person }) => (
		<PeopleRow person={item} />
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
				data={notifications}
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
