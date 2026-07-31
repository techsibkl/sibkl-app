import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StatusBar, Text, View } from "react-native";

import AssignmentFilterToggle, {
	AssignmentFilter,
} from "@/components/Flows/AssignmentFilterToggle";
import FlowSelector from "@/components/Flows/FlowSelect";
import PeopleFlowList, {
	FlowListItem,
} from "@/components/Flows/PeopleFlowAssignedList";
import SortButton from "@/components/Flows/SortButton";
import FlowStatusTabs from "@/components/Flows/StatusTabs";
import HelpDialog from "@/components/shared/HelpDialog";
import SharedBody from "@/components/shared/SharedBody";
import SharedModal from "@/components/shared/SharedModal";
import {
	useFlowsQuery,
	usePeopleFlowAllQuery,
	usePeopleFlowQuery,
} from "@/hooks/Flows/useFlowsQuery";
import {
	FlowSortKey,
	FlowSortOrder,
	FlowStatus,
} from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { useAuthStore } from "@/stores/authStore";
import { useLocalSearchParams } from "expo-router";
import { HelpCircle } from "lucide-react-native";

const FlowsPage = () => {
	const { user } = useAuthStore();
	const person = user?.person;

	const [searchQuery, setSearchQuery] = useState("");
	const [assignmentFilter, setAssignmentFilter] =
		useState<AssignmentFilter>(null);
	const [selectedStatus, setSelectedStatus] = useState<FlowStatus | null>(
		null,
	);
	const [sortKey, setSortKey] = useState<FlowSortKey | null>(null);
	const [sortOrder, setSortOrder] = useState<FlowSortOrder>("desc");
	const [selectedFlowId, setSelectedFlowId] = useState<number>(0);
	const [flowHelpVisible, setFlowHelpVisible] = useState(false);
	const [filterHelpVisible, setFilterHelpVisible] = useState(false);

	const { flow_id, assignmentFilter: filterParam } = useLocalSearchParams<{
		flow_id?: string;
		assignmentFilter?: string;
	}>();

	useEffect(() => {
		if (flow_id) {
			setSelectedFlowId(Number(flow_id));
			if (
				filterParam === "district" ||
				filterParam === "cell" ||
				filterParam === "me"
			) {
				setAssignmentFilter(filterParam);
			}
		}
	}, [flow_id, filterParam]);

	// Single-flow query (used when a specific flow is selected)
	const {
		data: singleFlowPeople,
		isPending: singleFlowPending,
		refetch: singleFlowRefetch,
	} = usePeopleFlowQuery(selectedFlowId);

	// All-accessible query — one call, backend CASL-scoped; all filters applied client-side
	const {
		data: allPeople,
		isPending: allPeoplePending,
		refetch: allPeopleRefetch,
	} = usePeopleFlowAllQuery();

	const flowIds = useMemo(
		() => [...new Set(allPeople?.map((p) => p.flow_id) || [])],
		[allPeople],
	);

	const {
		data: flows,
		isPending: flowsPending,
		refetch: flowRefetch,
	} = useFlowsQuery(flowIds as number[]);

	const allPending = useMemo(
		() => singleFlowPending || allPeoplePending || flowsPending,
		[singleFlowPending, allPeoplePending, flowsPending],
	);

	// Derived identity sets for client-side filtering/sectioning
	const personId = person?.id;
	const districtIds = useMemo(
		() => [
			...(person?.pastor_district_ids ?? []),
			...(person?.admin_district_ids ?? []),
		],
		[person?.pastor_district_ids, person?.admin_district_ids],
	);
	const cellIds = useMemo(
		() => [
			...(person?.leader_of_cell_ids ?? []),
			...(person?.core_of_cell_ids ?? []),
		],
		[person?.leader_of_cell_ids, person?.core_of_cell_ids],
	);

	// Pre-status-filter list (search + assignment filter applied) — fed into the tab counts
	const preFilteredPeopleFlow = useMemo(() => {
		let list: PeopleFlow[] =
			selectedFlowId === 0 ? (allPeople ?? []) : (singleFlowPeople ?? []);

		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(p) =>
					p?.p__full_legal_name?.toLowerCase().includes(q) ||
					p?.p__phone?.includes(searchQuery),
			);
		}

		if (assignmentFilter === "me") {
			list = list.filter((p) => p.assignee_id === personId);
		} else if (assignmentFilter === "cell") {
			list = list.filter(
				(p) =>
					p.assigned_cell_id != null &&
					cellIds.includes(p.assigned_cell_id),
			);
		} else if (assignmentFilter === "district") {
			list = list.filter(
				(p) =>
					p.district_id != null &&
					districtIds.includes(p.district_id),
			);
		}

		return list;
	}, [
		selectedFlowId,
		allPeople,
		singleFlowPeople,
		searchQuery,
		assignmentFilter,
		personId,
		cellIds,
		districtIds,
	]);

	// Final list — status tab + sort applied on top
	const effectivePeopleFlow = useMemo(() => {
		let list =
			selectedStatus === null
				? preFilteredPeopleFlow
				: preFilteredPeopleFlow.filter(
						(p) => p.status === selectedStatus,
					);

		if (sortKey) {
			list = [...list].sort((a, b) => {
				const aVal = a[sortKey] ? new Date(a[sortKey]).getTime() : 0;
				const bVal = b[sortKey] ? new Date(b[sortKey]).getTime() : 0;
				return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
			});
		}

		return list;
	}, [preFilteredPeopleFlow, selectedStatus, sortKey, sortOrder]);

	// Build flat list data — with section headers when in ALL FLOWS + no filter
	const listData = useMemo<FlowListItem[]>(() => {
		const groups: Record<
			"district" | "cell" | "me" | "others",
			PeopleFlow[]
		> = {
			district: [],
			cell: [],
			me: [],
			others: [],
		};

		for (const item of effectivePeopleFlow) {
			if (item.assignee_id === personId) {
				groups.me.push(item);
			} else if (
				item.assigned_cell_id != null &&
				cellIds.includes(item.assigned_cell_id)
			) {
				groups.cell.push(item);
			} else if (
				item.district_id != null &&
				districtIds.includes(item.district_id)
			) {
				groups.district.push(item);
			} else {
				groups.others.push(item);
			}
		}

		const result: FlowListItem[] = [];
		const sectionDefs: Array<{ title: string; key: keyof typeof groups }> =
			[
				{ title: "Assigned to my District", key: "district" },
				{ title: "Assigned to my Cell", key: "cell" },
				{ title: "Assigned to Me", key: "me" },
				{ title: "Others", key: "others" },
			];

		for (const { title, key } of sectionDefs) {
			const items = groups[key];
			if (items.length > 0) {
				result.push({
					kind: "header",
					title: `${title} (${items.length})`,
					sectionKey: key,
				});
				for (const item of items) {
					result.push({ kind: "row", data: item });
				}
			}
		}

		return result;
	}, [
		effectivePeopleFlow,
		assignmentFilter,
		selectedFlowId,
		personId,
		cellIds,
		districtIds,
	]);

	const handleSortChange = (key: FlowSortKey, order: FlowSortOrder) => {
		setSortKey(key);
		setSortOrder(order);
	};

	const handleSortClear = () => {
		setSortKey(null);
		setSortOrder("desc");
	};

	const refresh = async () => {
		if (selectedFlowId === 0) {
			await allPeopleRefetch();
		} else {
			await singleFlowRefetch();
		}
		flowRefetch();
	};

	return (
		<SharedBody>
			<StatusBar className="bg-background" />
			<View className="flex-row items-center pr-4 pb-4 border-b border-border">
				<View className="flex-1">
					<SharedSearchBar
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						placeholder="Search keywords..."
						unstyled
					/>
				</View>
				<SortButton
					sortKey={sortKey}
					sortOrder={sortOrder}
					onChange={handleSortChange}
					onClear={handleSortClear}
				/>
			</View>

			{/* Flow selector + assignment filter */}
			<View className="flex-row gap-2 px-4 mt-4 min-h-[60px]">
				{/* Select people flow with help */}
				<View className="flex-1 gap-1 h-full">
					<View className="flex-row items-center ml-1">
						<Text className="text-xs text-text-secondary">
							Select people flow:
						</Text>
						<Pressable
							onPress={() => setFlowHelpVisible(true)}
							className="ml-1"
						>
							<HelpCircle size={14} color="#9CA3AF" />
						</Pressable>
					</View>
					<FlowSelector
						flows={flows ?? []}
						selectedFlowId={selectedFlowId}
						onSelect={setSelectedFlowId}
					/>
				</View>
				{/* Switch filter view with help */}
				<View className="flex-1 gap-1 h-full">
					<View className="flex-row items-center ml-1">
						<Text className="text-xs text-text-secondary">
							Switch filter view:
						</Text>
						<Pressable
							onPress={() => setFilterHelpVisible(true)}
							className="ml-1"
						>
							<HelpCircle size={14} color="#9CA3AF" />
						</Pressable>
					</View>
					<AssignmentFilterToggle
						value={assignmentFilter}
						onChange={setAssignmentFilter}
						roles={person?.roles}
					/>
				</View>
			</View>

			{/* Status tab bar — counts reflect search + assignment filter */}
			<FlowStatusTabs
				peopleFlow={preFilteredPeopleFlow}
				selectedStatus={selectedStatus}
				onSelect={setSelectedStatus}
			/>

			<PeopleFlowList
				key={flows?.map((f) => f.id).toString()}
				listData={listData}
				flows={flows}
				selectedFlowId={selectedFlowId}
				onRefresh={refresh}
				isPending={allPending}
			/>

			{/* Help Modals */}
			<SharedModal
				visible={flowHelpVisible}
				onClose={() => setFlowHelpVisible(false)}
			>
				<HelpDialog
					title="Select People Flow"
					description="Choose a specific flow to view people in that flow, or select 'All Flows' to see people across all flows. Each flow represents a form or path that people are channeled through."
				/>
			</SharedModal>

			<SharedModal
				visible={filterHelpVisible}
				onClose={() => setFilterHelpVisible(false)}
			>
				<HelpDialog
					title="Switch Filter View"
					description="Filter your list based on assignment scope: 'All' shows everyone, 'My District' shows people assigned to your district, 'My Cell' shows people assigned to your cell, and 'Me' shows only people assigned directly to you."
				/>
			</SharedModal>
		</SharedBody>
	);
};

export default FlowsPage;
