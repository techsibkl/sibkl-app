"use client";

import PeopleList from "@/components/People/PeopleList";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { usePeopleQuery } from "@/hooks/People/usePeopleQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, StatusBar, Text, View } from "react-native";

const PeopleScreen = () => {
	const { isDark } = useThemeColors();
	const { data: people, isPending, error, isError } = usePeopleQuery();

	const [searchQuery, setSearchQuery] = useState("");

	const filteredPeople = useMemo(() => {
		return (people ?? []).filter(
			(person) =>
				person?.full_name
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				person?.phone?.includes(searchQuery)
		);
	}, [people, searchQuery]);

	// const handlePersonPress = (person: Person) => {
	//   // Navigate to profile or handle person selection
	//   console.log("Opening profile for:", person.fullName);
	// };

	if (isPending)
		return (
			<SharedBody>
				<ActivityIndicator />
			</SharedBody>
		);
	if (isError)
		return (
			<SharedBody>
				{/* <Text>{JSON.stringify(error)}</Text> */}
				<Text>{error.message}</Text>
				<Text>{error.name}</Text>
			</SharedBody>
		);

	return (
		<SharedBody>
			<StatusBar
				className="bg-background dark:bg-background-dark"
				barStyle={isDark ? "light-content" : "dark-content"}
			/>
			{/* Search Bar */}
			<SharedSearchBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				placeholder="Search people..."
			/>
			{/* People List */}
			<View className="flex-1">
				<PeopleList people={filteredPeople} />
			</View>
		</SharedBody>
	);
};

export default PeopleScreen;
