import { Person } from "@/services/Person/person.type";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import SkeletonPeopleRow from "../shared/Skeleton/SkeletonPeopleRow";
import PeopleRow from "./PeopleRow";

type PeopleListProps = {
	people: Person[];
};

const PeopleList = ({ people }: PeopleListProps) => {
	const renderItem = ({ item }: { item: Person }) => (
		<PeopleRow person={item} />
	);

	return (
		<FlashList
			data={people}
			contentContainerStyle={{
				paddingHorizontal: 12,
				paddingVertical: 8,
			}}
			keyExtractor={(item) => item.id.toString()}
			ListEmptyComponent={SkeletonPeopleRow}
			estimatedItemSize={100}
			removeClippedSubviews
			renderItem={renderItem}
		/>
	);
};

export default PeopleList;
