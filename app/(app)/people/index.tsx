"use client";

import PeopleList from "@/components/People/PeopleList";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { usePeoplePaginatedQuery } from "@/hooks/People/usePeopleQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import React, { useEffect, useState } from "react";
import { StatusBar, Text, View } from "react-native";

const PeopleScreen = () => {
	const { isDark } = useThemeColors();
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	// Debounce search so we don't fire on every keystroke
	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(searchQuery), 600);
		return () => clearTimeout(t);
	}, [searchQuery]);

	const {
		people,
		isPending,
		isError,
		error,
		refetch,
		loadMore,
		isLoadingMore,
		hasMore,
	} = usePeoplePaginatedQuery({
		search: debouncedSearch || undefined,
		sortField: "created_at",
		sortOrder: "DESC",
		pageSize: 50,
	});

	const refresh = async () => {
		await refetch();
	};

	if (isError)
		return (
			<SharedBody>
				<Text>{error.message}</Text>
			</SharedBody>
		);

	return (
		<SharedBody>
			<StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
			<SharedSearchBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				placeholder="Search people..."
			/>
			<View className="flex-1">
				<PeopleList
					people={people}
					onRefresh={refresh}
					onLoadMore={loadMore}
					isPending={isPending}
					isLoadingMore={isLoadingMore}
					hasMore={hasMore}
				/>
			</View>
		</SharedBody>
	);
};

export default PeopleScreen;
