import SharedButton from "@/components/shared/SharedButton";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useAddCellMembersMutation } from "@/hooks/CellAttendance/useCellAttendanceQuery";
import { usePeopleScopedMaskedFieldsQuery } from "@/hooks/People/usePeopleQuery";
import { Person } from "@/services/Person/person.type";
import { useAuthStore } from "@/stores/authStore";
import { myToast } from "@/utils/helper";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import { debounce } from "lodash";
import { CheckCircle, X } from "lucide-react-native";
import React, { forwardRef, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Toast from "react-native-toast-message";

type AddMembersSheetProps = {
	cellId: number;
	currentMembers?: Array<{ id: number }>;
	onSuccess?: () => void;
};

const AddMembersSheet = forwardRef<BottomSheetModal, AddMembersSheetProps>(
	({ cellId, currentMembers = [], onSuccess }, ref) => {
		const { user } = useAuthStore();
		const [searchTerm, setSearchTerm] = useState("");
		const [debouncedSearch, setDebouncedSearch] = useState("");
		const [selectedPeople, setSelectedPeople] = useState<
			Array<{ id: number; full_legal_name?: string }>
		>([]);

		const { data: people = [], isLoading } =
			usePeopleScopedMaskedFieldsQuery();
		const { mutateAsync: addMembers, isPending: isSubmitting } =
			useAddCellMembersMutation(cellId);

		// Debounce search term
		const debouncedSetSearch = useMemo(
			() =>
				debounce((val: string) => {
					setDebouncedSearch(val);
				}, 300),
			[],
		);

		React.useEffect(() => {
			debouncedSetSearch(searchTerm);
		}, [searchTerm, debouncedSetSearch]);

		// Filter people - exclude those already in the cell and search
		const filteredPeople = useMemo(() => {
			const currentMemberIds = new Set(currentMembers.map((m) => m.id));
			const selectedIds = new Set(selectedPeople.map((p) => p.id));

			return people.filter((person) => {
				// Exclude if already in cell
				if (currentMemberIds.has(person.id)) return false;

				// Filter by search term
				const matchesSearch =
					(person.full_legal_name?.toLowerCase() ?? "").includes(
						debouncedSearch.toLowerCase(),
					) ||
					(person.email?.toLowerCase() ?? "").includes(
						debouncedSearch.toLowerCase(),
					);

				return matchesSearch;
			});
		}, [people, debouncedSearch, currentMembers, selectedPeople]);

		const togglePerson = (person: any) => {
			const isSelected = selectedPeople.some((p) => p.id === person.id);
			if (isSelected) {
				setSelectedPeople(
					selectedPeople.filter((p) => p.id !== person.id),
				);
			} else {
				setSelectedPeople([
					...selectedPeople,
					{
						id: person.id,
						full_legal_name: person.full_legal_name,
					},
				]);
			}
		};

		const removePerson = (personId: number) => {
			setSelectedPeople(selectedPeople.filter((p) => p.id !== personId));
		};

		const handleAddMembers = async () => {
			if (selectedPeople.length === 0 || !user?.uid) return;

			try {
				await addMembers({
					cellId: cellId,
					people: selectedPeople as Person[],
				});

				// Close modal and reset
				setSelectedPeople([]);
				setSearchTerm("");
				(ref as React.RefObject<BottomSheetModal>).current?.close();
				Toast.show(
					myToast({
						success: true,
						message: `${selectedPeople.length} member${selectedPeople.length !== 1 ? "s" : ""} added successfully`,
					}),
				);
				onSuccess?.();
			} catch (error) {
				console.error("Error adding members:", error);
			}
		};

		return (
			<BottomSheetModal
				ref={ref}
				snapPoints={["98%"]}
				containerStyle={{
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 1 },
					shadowOpacity: 0.25,
					shadowRadius: 3.84,
				}}
				enablePanDownToClose
				handleComponent={null}
				enableDynamicSizing={false}
			>
				<View className="flex-1 bg-white rounded-t-[15px]">
					{/* Header */}
					<View className="py-4 border-b border-gray-200">
						<View className="px-6 mb-3 flex-row items-center justify-between">
							<Text className="text-lg font-semibold text-gray-900">
								Add Members
							</Text>
							<TouchableOpacity
								onPress={() =>
									(
										ref as React.RefObject<BottomSheetModal>
									).current?.close()
								}
								className="w-8 h-8 items-center justify-center"
							>
								<X size={24} color="#374151" />
							</TouchableOpacity>
						</View>

						{/* Search Input */}

						<SharedSearchBar
							searchQuery={searchTerm}
							onSearchChange={(value) => setSearchTerm(value)}
							unstyled
						/>
					</View>

					{/* Selected People Chips */}
					{selectedPeople.length > 0 && (
						<View className="px-6 py-3 border-b border-gray-200">
							<View className="flex-row flex-wrap gap-2">
								{selectedPeople.map((person) => (
									<View
										key={person.id}
										className="flex-row items-center bg-blue-100 rounded-full pl-3 pr-1 py-1"
									>
										<Text className="text-sm text-blue-900 mr-2">
											{person.full_legal_name}
										</Text>
										<TouchableOpacity
											onPress={() =>
												removePerson(person.id)
											}
											className="p-1"
										>
											<X size={16} color="#1e3a8a" />
										</TouchableOpacity>
									</View>
								))}
							</View>
						</View>
					)}

					{/* People List */}
					{isLoading ? (
						<View className="flex-1 items-center justify-center">
							<ActivityIndicator size="large" color="#3b82f6" />
						</View>
					) : filteredPeople.length === 0 ? (
						<View className="flex-1 items-center justify-center px-6">
							<Text className="text-gray-500 text-center">
								{selectedPeople.length === 0 &&
								debouncedSearch === ""
									? "No people available"
									: "No people found matching your search"}
							</Text>
						</View>
					) : (
						<BottomSheetFlatList
							data={filteredPeople}
							keyExtractor={(item) => String(item.id)}
							renderItem={({ item: person }) => (
								<Pressable
									onPress={() => togglePerson(person)}
									className={`px-6 py-3 border-b border-gray-100 flex-row items-center justify-between ${
										selectedPeople.some(
											(p) => p.id === person.id,
										)
											? "bg-blue-50"
											: ""
									}`}
								>
									<View className="flex-1">
										<Text className="text-gray-900 font-medium">
											{person.full_legal_name ?? "-"}
										</Text>
										<Text className="text-gray-500 text-sm">
											{person.email ?? "-"}
										</Text>
									</View>
									{selectedPeople.some(
										(p) => p.id === person.id,
									) && (
										<CheckCircle
											size={24}
											color="#2563eb"
										/>
									)}
								</Pressable>
							)}
						/>
					)}

					{/* Footer with Action Button */}
					<View className="border-t border-gray-200 px-6 py-4 flex-row gap-3">
						<TouchableOpacity
							onPress={() =>
								(
									ref as React.RefObject<BottomSheetModal>
								).current?.close()
							}
							className="flex-1 items-center justify-center py-3 bg-gray-200 rounded-lg"
						>
							<Text className="text-gray-700 font-semibold">
								Cancel
							</Text>
						</TouchableOpacity>

						<SharedButton
							className="flex-1"
							title={`Add ${selectedPeople.length} Member${selectedPeople.length !== 1 ? "s" : ""}`}
							onPress={handleAddMembers}
							disabled={
								selectedPeople.length === 0 || isSubmitting
							}
							isLoading={isSubmitting}
						/>
					</View>
				</View>
			</BottomSheetModal>
		);
	},
);

AddMembersSheet.displayName = "AddMembersSheet";

export default AddMembersSheet;
