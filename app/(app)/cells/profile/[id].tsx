"use client";

import MembersList from "@/components/Cells/Profile/MembersList";
import ComingSoon from "@/components/shared/ComingSoon";
import SharedBody from "@/components/shared/SharedBody";
import { useSingleCellQuery } from "@/hooks/Cell/useSingleCellQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Person } from "@/services/Person/person.type";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const CellProfileScreen = () => {
	const router = useRouter();
	const { isDark } = useThemeColors();
	const { id } = useLocalSearchParams();

	const {
		data: cell,
		isPending,
		error,
		isError,
	} = useSingleCellQuery(Number(id));

	const [activeTab, setActiveTab] = useState<
		"people" | "announcements" | "attendance"
	>("people");
	const [searchQuery, setSearchQuery] = useState("");

	const filteredMembers = (cell?.members ?? []).filter((member: Person) =>
		member?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const renderTabContent = () => {
		switch (activeTab) {
			case "people":
				return (
					<MembersList
						members={filteredMembers}
						searchQuery={searchQuery}
						onChangeText={setSearchQuery}
					/>
				);
			case "announcements":
				return <ComingSoon description="Announcements coming soon" />;
			case "attendance":
				return (
					<ComingSoon description="Attendance tracking coming soon" />
				);
			default:
				return null;
		}
	};

	if (isPending)
		return (
			<SharedBody>
				<ActivityIndicator />
			</SharedBody>
		);
	if (isError)
		return (
			<SharedBody>
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

			<ScrollView>
				{/* Cell info section */}
				<View className="items-center py-8">
					<View className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center mb-6">
						<Text className="text-white text-2xl font-bold">
							tc
						</Text>
					</View>
					<Text className="text-text text-2xl font-bold text-center mb-2">
						{cell.cell_name}
					</Text>
					<Text className="text-text-secondary text-base">
						Cell • {cell.members?.length} member
						{cell.members?.length === 1 ? "" : "s"}
					</Text>
				</View>

				<Text>{Array.isArray(cell.members)}</Text>

				{/* Tab bar */}
				<View className="flex-row mx-6 mb-6">
					{["people", "announcements", "attendance"].map((tab) => (
						<TouchableOpacity
							key={tab}
							className={`flex-1 py-3 ${
								tab === "people"
									? "rounded-l-lg border border-border"
									: tab === "attendance"
										? "rounded-r-lg border border-border"
										: " border-t border-b border-border"
							} ${activeTab === tab ? "bg-background" : "bg-background-secondary"}`}
							onPress={() =>
								setActiveTab(tab as typeof activeTab)
							}
						>
							<Text
								className={`text-center text-sm text-nowrap font-medium ${
									activeTab === tab
										? "text-text"
										: "text-text-secondary"
								}`}
							>
								{tab.charAt(0).toUpperCase() + tab.slice(1)}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{renderTabContent()}
			</ScrollView>
		</SharedBody>
	);
};

export default CellProfileScreen;
