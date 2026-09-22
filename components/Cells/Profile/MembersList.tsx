import { ChevronDownIcon, ChevronUpIcon } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import MemberRow from "./MemberRow";

type MembersListProps = {
	members: any[];
	searchQuery: string;
	isLeader?: boolean;
	currentPersonId?: number;
	memberStatuses?: Record<number, string>;
	onAccept?: (memberId: number) => void;
	onReject?: (memberId: number) => void;
	isUpdating?: number | null;
	onRemoveMember?: (memberId: number) => void;
	onCoreToggled?: () => void;
	cellLeader1Id?: number | null;
	cellLeader2Id?: number | null;
};

type SectionKey = "PENDING" | "ACTIVE" | "REJECTED";

const MembersList = ({
	members,
	searchQuery,
	isLeader = false,
	currentPersonId,
	memberStatuses = {},
	onAccept,
	onReject,
	isUpdating = null,
	onRemoveMember,
	onCoreToggled,
	cellLeader1Id,
	cellLeader2Id,
}: MembersListProps) => {
	const [expandedSections, setExpandedSections] = useState<
		Record<SectionKey, boolean>
	>({
		PENDING: true,
		ACTIVE: true,
		REJECTED: false,
	});

	// Get status for a member
	const getMemberStatus = (member: any) =>
		memberStatuses[member.id] || member.status || "ACTIVE";

	// Helper function to determine member role priority
	const getMemberRolePriority = (member: any) => {
		const isLeader =
			member.id === cellLeader1Id || member.id === cellLeader2Id;
		if (isLeader) return 0; // Leaders first
		if (member.is_core) return 1; // Then cores
		return 2; // Then regular members
	};

	// Sort members by role and name
	const sortMembers = (membersToSort: any[]) => {
		return [...membersToSort].sort((a, b) => {
			const priorityA = getMemberRolePriority(a);
			const priorityB = getMemberRolePriority(b);

			// Sort by priority (role) first
			if (priorityA !== priorityB) {
				return priorityA - priorityB;
			}

			// Within same priority, sort by name
			const nameA = a.full_legal_name?.toLowerCase() ?? "";
			const nameB = b.full_legal_name?.toLowerCase() ?? "";
			return nameA.localeCompare(nameB);
		});
	};

	// Group members by status
	const groupedMembers = {
		PENDING: sortMembers(
			members.filter((m) => getMemberStatus(m) === "PENDING"),
		),
		ACTIVE: sortMembers(
			members.filter((m) => getMemberStatus(m) === "ACTIVE"),
		),
		REJECTED: sortMembers(
			members.filter((m) => getMemberStatus(m) === "REJECTED"),
		),
	};

	// Filter members based on search query
	const filteredMembers = {
		PENDING: groupedMembers.PENDING.filter(
			(m) =>
				m.full_legal_name
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				m.phone?.toLowerCase().includes(searchQuery.toLowerCase()),
		),
		ACTIVE: groupedMembers.ACTIVE.filter(
			(m) =>
				m.full_legal_name
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				m.phone?.toLowerCase().includes(searchQuery.toLowerCase()),
		),
		REJECTED: groupedMembers.REJECTED.filter(
			(m) =>
				m.full_legal_name
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				m.phone?.toLowerCase().includes(searchQuery.toLowerCase()),
		),
	};

	const toggleSection = (sectionKey: SectionKey) => {
		setExpandedSections((prev) => ({
			...prev,
			[sectionKey]: !prev[sectionKey],
		}));
	};

	const SectionHeader = ({
		title,
		count,
		sectionKey,
	}: {
		title: string;
		count: number;
		sectionKey: SectionKey;
	}) => {
		const isExpanded = expandedSections[sectionKey];

		return (
			<TouchableOpacity
				onPress={() => toggleSection(sectionKey)}
				activeOpacity={0.7}
				className="mt-0 px-6 py-4 bg-gray-100 flex-row items-center justify-between"
			>
				<Text className="text-xs font-bold uppercase tracking-wider text-gray-700 flex-1">
					{title} ({count})
				</Text>
				{isExpanded ? (
					<ChevronUpIcon size={16} color="#4b5563" />
				) : (
					<ChevronDownIcon size={16} color="#4b5563" />
				)}
			</TouchableOpacity>
		);
	};

	const renderMembersList = (
		membersList: any[],
		filteredList: any[],
		sectionKey: SectionKey,
	) => {
		const displayList = searchQuery ? filteredList : membersList;
		return displayList.map((member) => {
			const isCellLeader =
				member.id === cellLeader1Id || member.id === cellLeader2Id;
			return (
				<MemberRow
					key={member.id}
					member={member}
					isLeader={isLeader}
					currentPersonId={currentPersonId}
					memberStatuses={memberStatuses}
					onAccept={onAccept}
					onReject={onReject}
					isUpdating={isUpdating === member.id}
					onRemoveMember={onRemoveMember}
					onCoreToggled={onCoreToggled}
					isCellLeader={isCellLeader}
				/>
			);
		});
	};

	return (
		<View className="flex-1">
			<ScrollView
				contentContainerStyle={{
					paddingBottom: 40,
				}}
			>
				{/* Sections */}
				{groupedMembers.PENDING.length > 0 && (
					<View>
						<SectionHeader
							title="Pending"
							count={groupedMembers.PENDING.length}
							sectionKey="PENDING"
						/>
						{expandedSections.PENDING &&
							renderMembersList(
								groupedMembers.PENDING,
								filteredMembers.PENDING,
								"PENDING",
							)}
					</View>
				)}

				{groupedMembers.ACTIVE.length > 0 && (
					<View>
						<SectionHeader
							title="Active"
							count={groupedMembers.ACTIVE.length}
							sectionKey="ACTIVE"
						/>
						{expandedSections.ACTIVE &&
							renderMembersList(
								groupedMembers.ACTIVE,
								filteredMembers.ACTIVE,
								"ACTIVE",
							)}
					</View>
				)}

				{groupedMembers.REJECTED.length > 0 && (
					<View>
						<SectionHeader
							title="Rejected"
							count={groupedMembers.REJECTED.length}
							sectionKey="REJECTED"
						/>
						{expandedSections.REJECTED &&
							renderMembersList(
								groupedMembers.REJECTED,
								filteredMembers.REJECTED,
								"REJECTED",
							)}
					</View>
				)}

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
