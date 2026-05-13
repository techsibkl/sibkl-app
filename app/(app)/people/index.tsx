"use client";

import PeopleList from "@/components/People/PeopleList";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { usePeoplePaginatedQuery } from "@/hooks/People/usePeopleQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";

const PeopleScreen = () => {
	const { isDark } = useThemeColors();
	const { isGuest } = useAuthStore();
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

	// Guest user profile page
	if (isGuest) {
		return (
			<SharedBody>
				<View className="flex-1 justify-center items-center px-6">
					<View className="w-24 h-24 rounded-full bg-gray-300 items-center justify-center mb-6">
						<Text className="text-4xl font-bold text-gray-600">
							G
						</Text>
					</View>
					<Text className="text-2xl text-text font-bold mb-2">
						Guest User
					</Text>
					<Text className="font-regular text-text-secondary text-center mb-8">
						Sign in to access your people list and additional
						features
					</Text>
					<TouchableOpacity
						onPress={() => router.replace("/(auth)/sign-in")}
						className="bg-blue-600 px-6 py-3 rounded-lg"
					>
						<Text className="text-white font-semibold text-center">
							Sign In
						</Text>
					</TouchableOpacity>
				</View>
			</SharedBody>
		);
	}

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
