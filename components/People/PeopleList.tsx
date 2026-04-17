import { Person } from "@/services/Person/person.type";
import { useAuthStore } from "@/stores/authStore";
import { FlashList } from "@shopify/flash-list";
import React, { useState } from "react";
import { ActivityIndicator, RefreshControl, View } from "react-native";
import SkeletonList from "../shared/Skeleton/SkeletonList";
import PeopleRow from "./PeopleRow";

type PeopleListProps = {
	people: Person[];
	onRefresh?: () => Promise<void>;
	onLoadMore?: () => void;
	isPending?: boolean;
	isLoadingMore?: boolean;
	hasMore?: boolean;
};

const PeopleList = ({
	people,
	onRefresh,
	onLoadMore,
	isPending,
	isLoadingMore,
	hasMore,
}: PeopleListProps) => {
	const { user } = useAuthStore();
	const [refreshing, setRefreshing] = useState(false);

	const renderItem = ({ item }: { item: Person }) => (
		<PeopleRow person={item} isMe={item.id === user?.person?.id} />
	);

	const handleRefresh = async () => {
		if (!onRefresh) return;
		setRefreshing(true);
		await onRefresh();
		setRefreshing(false);
	};

	const handleEndReached = () => {
		if (hasMore && !isLoadingMore && !isPending) {
			onLoadMore?.();
		}
	};

	const ListFooter = () => {
		if (!isLoadingMore) return null;
		return (
			<View className="py-4 items-center">
				<ActivityIndicator size="small" color="#6b7280" />
			</View>
		);
	};

	if (isPending) return <SkeletonList length={20} />;

	return (
		<FlashList
			data={people}
			contentContainerStyle={{
				paddingHorizontal: 12,
				paddingVertical: 8,
			}}
			keyExtractor={(item) => item.id.toString()}
			estimatedItemSize={100}
			removeClippedSubviews
			renderItem={renderItem}
			onEndReached={handleEndReached}
			onEndReachedThreshold={0.3}
			ListFooterComponent={<ListFooter />}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={handleRefresh}
					colors={["#6b7280"]}
					tintColor="#6b7280"
				/>
			}
		/>
	);
};

export default PeopleList;
