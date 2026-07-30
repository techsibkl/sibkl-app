import toastConfig from "@/config/toastConfig";
import { Person } from "@/services/Person/person.type";
import { HomeIcon, MapPinIcon } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, SectionList, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import AssignDialogFooter from "./AssignDialogFooter";
import PersonListItem from "./PersonListItem";

export type AssignPersonDialogProps = {
	visible: boolean;
	onDismiss: () => void;
	onAssign: (person: Person) => void;
	people: Person[];
	loading?: boolean;
	currentAssignee?: Person | null;
	priorityCellId?: number | null;
	priorityDistrictId?: number | null;
};

const EMPTY = (
	<View className="px-4 py-8 items-center flex-1">
		<Text className="text-gray-500 text-sm">No people found</Text>
	</View>
);

const AssignPersonDialog = ({
	visible,
	onDismiss,
	onAssign,
	people,
	loading = false,
	currentAssignee,
	priorityCellId,
	priorityDistrictId,
}: AssignPersonDialogProps) => {
	const [selectedPerson, setSelectedPerson] = useState<Person | null>(
		currentAssignee || null,
	);
	const [searchText, setSearchText] = useState("");

	useEffect(() => {
		if (!visible) setSearchText("");
	}, [visible]);

	useEffect(() => {
		setSelectedPerson(currentAssignee || null);
	}, [currentAssignee]);

	const sections = useMemo(() => {
		const q = searchText.toLowerCase();
		const filtered = people.filter((p) =>
			(p.full_legal_name || "").toLowerCase().includes(q),
		);

		const cellMembers = filtered.filter(
			(p) =>
				priorityCellId &&
				Array.isArray(p.cell_ids) &&
				p.cell_ids.includes(priorityCellId),
		);
		const districtPeople = filtered.filter(
			(p) =>
				!cellMembers.includes(p) &&
				priorityDistrictId &&
				Array.isArray(p.district_ids) &&
				p.district_ids.includes(priorityDistrictId),
		);
		const others = filtered.filter(
			(p) => !cellMembers.includes(p) && !districtPeople.includes(p),
		);

		const result = [];
		if (cellMembers.length > 0)
			result.push({ title: "Cell Members", data: cellMembers });
		if (districtPeople.length > 0)
			result.push({ title: "District People", data: districtPeople });
		if (others.length > 0)
			result.push({ title: "Others", data: others });
		return result;
	}, [people, searchText, priorityCellId, priorityDistrictId]);

	const allFiltered = useMemo(() => sections.flatMap((s) => s.data), [sections]);
	const hasSections = (priorityCellId || priorityDistrictId) && sections.length > 0;

	const handleAssign = () => {
		if (!selectedPerson) return;
		onAssign(selectedPerson);
		onDismiss();
	};

	return (
		<Modal visible={visible} transparent animationType="slide">
			<View className="flex-1 bg-black/50 justify-end">
				<View className="bg-white rounded-t-2xl max-h-[85%] flex-1">
					{/* Header */}
					<View className="px-5 pt-5 pb-3">
						<Text className="text-lg text-text font-bold">Assign Follow-Up</Text>
						<Text className="text-sm text-gray-500">Select a person to assign</Text>
					</View>

					<SharedSearchBar
						searchQuery={searchText}
						onSearchChange={setSearchText}
						placeholder="Search person..."
					/>

					{hasSections ? (
						<SectionList
							sections={sections}
							keyExtractor={(item) => String(item.id)}
							contentContainerStyle={{ flexGrow: 1 }}
							renderSectionHeader={({ section }) => (
								<View className="px-4 py-2 bg-gray-50 flex-row items-center gap-1.5 border-b border-gray-200">
									{section.title === "Cell Members" && (
										<HomeIcon size={12} color="#6b7280" />
									)}
									{section.title === "District People" && (
										<MapPinIcon size={12} color="#6b7280" />
									)}
									<Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
										{section.title}
									</Text>
								</View>
							)}
							renderItem={({ item }) => (
								<PersonListItem
									person={item}
									selected={selectedPerson?.id === item.id}
									onPress={() => setSelectedPerson(item)}
								/>
							)}
							ListEmptyComponent={EMPTY}
						/>
					) : (
						<FlatList
							data={allFiltered}
							keyExtractor={(item) => String(item.id)}
							contentContainerStyle={{ flexGrow: 1 }}
							renderItem={({ item }) => (
								<PersonListItem
									person={item}
									selected={selectedPerson?.id === item.id}
									onPress={() => setSelectedPerson(item)}
								/>
							)}
							ListEmptyComponent={EMPTY}
						/>
					)}

					<AssignDialogFooter
						onCancel={onDismiss}
						onConfirm={handleAssign}
						isPending={loading}
						disabled={!selectedPerson}
					/>
				</View>
			</View>

			<Toast config={toastConfig} />
		</Modal>
	);
};

export default AssignPersonDialog;
