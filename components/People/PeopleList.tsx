import { Person } from "@/services/Person/person.type";
import { FlashList } from "@shopify/flash-list";
import React, { useState } from "react";
import { RefreshControl } from "react-native";
import SkeletonList from "../shared/Skeleton/SkeletonList";
import PeopleRow from "./PeopleRow";

type PeopleListProps = {
	people: Person[];
	onRefresh?: () => Promise<void>;
	isPending?: boolean;
};

const PeopleList = ({ people, onRefresh, isPending }: PeopleListProps) => {
	const renderItem = ({ item }: { item: Person }) => (
		<PeopleRow person={item} />
	);

	const [refreshing, setRefreshing] = useState(false);

	const handleRefresh = async () => {
		if (!onRefresh) return;
		setRefreshing(true);
		console.log("Refreshing people list...");
		await onRefresh();
		setRefreshing(false);
		console.log("Refresh complete.");
	};

	return (
		<FlashList
			data={people}
			contentContainerStyle={{
				paddingHorizontal: 12,
				paddingVertical: 8,
			}}
			keyExtractor={(item) => item.id.toString()}
			ListEmptyComponent={<SkeletonList length={20} />}
			estimatedItemSize={100}
			removeClippedSubviews
			renderItem={renderItem}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={handleRefresh}
					colors={["#6b7280"]} // Android spinner color
					tintColor="#6b7280" // iOS spinner color
				/>
			}
		/>
	);
};

export default PeopleList;
