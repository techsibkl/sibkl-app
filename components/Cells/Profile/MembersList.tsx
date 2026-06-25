import { Search } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import AddMemberButton from "./AddMemberButton";
import MemberRow from "./MemberRow";

type MembersListProps = {
	members: any[];
	searchQuery: string;
	onChangeText: (value: string) => void;
	isLeader?: boolean;
	memberStatuses?: Record<number, string>;
	onAccept?: (memberId: number) => void;
	onReject?: (memberId: number) => void;
	isUpdating?: number | null;
};

const MembersList = ({
	members,
	searchQuery,
	onChangeText,
	isLeader = false,
	memberStatuses = {},
	onAccept,
	onReject,
	isUpdating = null,
}: MembersListProps) => {
	// Get status for a member
	const getMemberStatus = (member: any) =>
		memberStatuses[member.id] || member.status || "ACTIVE";

	// Group members by status
	const groupedMembers = {
		PENDING: members.filter((m) => getMemberStatus(m) === "PENDING"),
		ACTIVE: members.filter((m) => getMemberStatus(m) === "ACTIVE"),
		REJECTED: members.filter((m) => getMemberStatus(m) === "REJECTED"),
	};

	// Render section with header and members
	const renderSection = (
		title: string,
		membersList: any[],
		count: number
	) => {
		if (membersList.length === 0) return null;

		return (
			<View key={title}>
				<Text className="text-gray-300 text-xs font-semibold px-4 py-1 mt-2">
					· {title} ({count})
				</Text>
				{membersList.map((member) => (
					<MemberRow
						key={member.id}
						member={member}
						isLeader={isLeader}
						memberStatuses={memberStatuses}
						onAccept={onAccept}
						onReject={onReject}
						isUpdating={isUpdating === member.id}
					/>
				))}
			</View>
		);
	};

	return (
		<View className="flex-1">
			<ScrollView
				contentContainerStyle={{
					paddingBottom: 40,
					paddingHorizontal: 0,
				}}
			>
				{/* Search bar */}
				<View className="px-4 mb-2 flex-row items-center rounded-xl bg-white border border-border">
					<Search size={20} color="#999" />
					<TextInput
						className="flex-1 text-text-secondary text-base"
						placeholder="Search members..."
						placeholderTextColor="#999"
						value={searchQuery}
						onChangeText={onChangeText}
					/>
				</View>

				{/* Add Member Button */}
				{/* <View className="px-4 mb-2">
					<AddMemberButton />
				</View> */}

				{/* Sections */}
				{renderSection("PENDING", groupedMembers.PENDING, groupedMembers.PENDING.length)}
				{renderSection("ACTIVE", groupedMembers.ACTIVE, groupedMembers.ACTIVE.length)}
				{renderSection("REJECTED", groupedMembers.REJECTED, groupedMembers.REJECTED.length)}

				{/* No members message */}
				{members.length === 0 && (
					<View className="items-center justify-center py-8 px-4">
						<Text className="text-text-secondary text-center">
							No members found
						</Text>
					</View>
				)}
			</ScrollView>
		</View>
	);
};

export default MembersList;