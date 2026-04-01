"use client";

import CellList from "@/components/Cells/CellList";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import {
	useSinglePersonQuery
} from "@/hooks/People/usePeopleQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Cell } from "@/services/Cell/cell.types";
import { useAuthStore } from "@/stores/authStore";
import React, { useState } from "react";
import { StatusBar, Text, View } from "react-native";

const CellsScreen = () => {
	const { isDark } = useThemeColors();
	const { user } = useAuthStore();
	const { data: person } = useSinglePersonQuery(user?.person?.id ?? -1);
	const [searchQuery, setSearchQuery] = useState("");

	const filteredCells = (person?.cells ?? []).filter((cell: Cell) =>
		cell?.cell_name?.toLowerCase().includes(searchQuery.toLowerCase()),
	);
	// // derive filtered list
	// const filteredCells = (user?.person?.cells ?? []).filter((cell: Cell) =>
	// 	cell?.cell_name?.toLowerCase().includes(searchQuery.toLowerCase())
	// );

	if (!user)
		return (
			<SharedBody>
				<Text>Unauthenticated</Text>
				<Text>Go Away!!!!</Text>
			</SharedBody>
		);

	return (
		<SharedBody>
			<StatusBar
				className="bg-background"
				barStyle={isDark ? "light-content" : "dark-content"}
			/>

			<SharedSearchBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				placeholder="Search cells..."
			/>

			{/* Content */}
			<View className="flex-1">
				<CellList cells={filteredCells} />
			</View>
		</SharedBody>
	);
};

export default CellsScreen;
