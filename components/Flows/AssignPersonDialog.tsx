import { Person } from "@/services/Person/person.type";
import { getInitials } from "@/utils/helper_profile";
import React, { useEffect, useState } from "react";
import {
	Alert,
	FlatList,
	Modal,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import SharedButton from "../shared/SharedButton";
import { SharedSearchBar } from "../shared/SharedSearchBar";

type AssignPersonDialogProps = {
	visible: boolean;
	onDismiss: () => void;
	onAssign: (person: Person) => void;
	people: Person[];
	loading?: boolean;
	currentAssignee?: Person | null;
};

const AssignPersonDialog = ({
	visible,
	onDismiss,
	onAssign,
	people,
	loading = false,
	currentAssignee,
}: AssignPersonDialogProps) => {
	const [selectedPerson, setSelectedPerson] = useState<Person | null>(
		currentAssignee || null,
	);
	const [searchText, setSearchText] = useState("");

	useEffect(() => {
		if (!visible) {
			setSearchText("");
		}
	}, [visible]);

	const filteredPeople = people.filter((p) =>
		(p.full_legal_name || "")
			.toLowerCase()
			.includes(searchText.toLowerCase()),
	);

	const handleAssign = () => {
		if (!selectedPerson) {
			Alert.alert("Error", "Please select a person to assign");
			return;
		}
		onAssign(selectedPerson);
		onDismiss();
	};

	return (
		<Modal visible={visible} transparent animationType="slide">
			<View className="flex-1 bg-black/50 justify-end">
				<View className="bg-white rounded-t-2xl max-h-[80%]">
					{/* Header */}
					<View className="px-4 py-3">
						<Text className="text-lg text-text font-bold">
							Assign Follow-Up
						</Text>
						<Text className="text-sm text-gray-500">
							Select a person to assign
						</Text>
					</View>

					{/* Search Input */}

					<SharedSearchBar
						searchQuery={searchText}
						onSearchChange={setSearchText}
						placeholder="Search person..."
					/>

					{/* People List */}
					<FlatList
						data={filteredPeople}
						keyExtractor={(item) => String(item.id)}
						contentContainerStyle={{ flexGrow: 1 }}
						renderItem={({ item }) => (
							<TouchableOpacity
								onPress={() => setSelectedPerson(item)}
								className={`px-4 py-3 border-b border-border flex-row items-center justify-between ${
									selectedPerson?.id === item.id
										? "bg-blue-50"
										: ""
								}`}
							>
								<View className="flex-row items-center flex-1">
									{/* Avatar */}
									<View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
										<Text className="text-xs font-bold text-text">
											{getInitials(item.full_legal_name)}
										</Text>
									</View>
									<View className="flex-1">
										<Text className="font-semibold text-text text-sm">
											{item.full_legal_name}
										</Text>
										{item.phone && (
											<Text className="text-xs text-gray-500 mt-0.5">
												{item.phone}
											</Text>
										)}
									</View>
								</View>
								{selectedPerson?.id === item.id && (
									<Text className="text-blue-600 font-bold">
										✓
									</Text>
								)}
							</TouchableOpacity>
						)}
						ListEmptyComponent={
							<View className="px-4 py-8 items-center">
								<Text className="text-gray-500 text-sm">
									No people found
								</Text>
							</View>
						}
					/>

					{/* Footer Buttons */}
					<View className="px-4 py-3 flex-row gap-2 bg-white">
						<SharedButton
							className="flex-1 justify-center items-center bg-gray-100"
							onPress={onDismiss}
							title="Cancel"
							disabled={loading}
							variant="secondary"
						/>
						<SharedButton
							className="flex-1 justify-center items-center"
							onPress={handleAssign}
							title={loading ? "Assigning..." : "Assign"}
							isLoading={loading}
							disabled={!selectedPerson || loading}
							variant="primary"
						/>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default AssignPersonDialog;
