import SharedButton from "@/components/shared/SharedButton";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useAddCellMembersMutation } from "@/hooks/CellAttendance/useCellAttendanceQuery";
import { usePeopleScopedMaskedFieldsQuery } from "@/hooks/People/usePeopleQuery";
import { MaskedPerson, Person } from "@/services/Person/person.type";
import { useAuthStore } from "@/stores/authStore";
import { myToast } from "@/utils/helper";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import { debounce } from "lodash";
import { CheckCircle, X } from "lucide-react-native";
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Toast from "react-native-toast-message";

type CellMemberRef = {
	id: number;
	status?: string;
	member_status?: string;
};

type AddMembersSheetProps = {
	cellId: number;
	currentMembers?: CellMemberRef[];
	onSuccess?: (addedIds: number[]) => void;
};

type SearchEntry = {
	person: MaskedPerson;
	name: string;
	email: string;
};

function memberStatus(member: CellMemberRef) {
	return member.status || member.member_status || "ACTIVE";
}

function rosterSignature(members: CellMemberRef[]) {
	let signature = "";
	for (const member of members) {
		signature += `${member.id}:${member.status ?? ""}:${member.member_status ?? ""};`;
	}
	return signature;
}

const MemberResultRow = React.memo(function MemberResultRow({
	person,
	selected,
	onToggle,
}: {
	person: MaskedPerson;
	selected: boolean;
	onToggle: (person: MaskedPerson) => void;
}) {
	return (
		<Pressable
			onPress={() => onToggle(person)}
			className={`px-6 py-3 border-b border-gray-100 flex-row items-center justify-between ${
				selected ? "bg-blue-50" : ""
			}`}
		>
			<View className="flex-1">
				<View className="flex-row items-center gap-2">
					<Text className="text-gray-900 font-medium shrink" numberOfLines={1}>
						{person.full_legal_name ?? "-"}
					</Text>
					{person.has_account ? (
						<View className="rounded-full bg-emerald-50 px-2 py-0.5">
							<Text className="text-[11px] font-medium text-emerald-700">
								Has account
							</Text>
						</View>
					) : null}
				</View>
				<Text className="text-gray-500 text-sm" numberOfLines={1}>
					{person.email ?? "-"}
				</Text>
			</View>
			{selected && <CheckCircle size={24} color="#2563eb" />}
		</Pressable>
	);
});

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

		useEffect(() => {
			debouncedSetSearch(searchTerm);
		}, [searchTerm, debouncedSetSearch]);

		useEffect(() => {
			return () => {
				debouncedSetSearch.cancel();
			};
		}, [debouncedSetSearch]);

		// Parent builds a new members array every render. Key off the contents.
		const membersKey = rosterSignature(currentMembers);
		const roster = useMemo(() => {
			const occupiedMemberIds = new Set<number>();
			const reactivateMemberIds = new Set<number>();
			for (const member of currentMembers) {
				const status = memberStatus(member);
				if (status === "ACTIVE" || status === "PENDING") {
					occupiedMemberIds.add(member.id);
				} else if (status === "REJECTED" || status === "REMOVED") {
					reactivateMemberIds.add(member.id);
				}
			}
			return { occupiedMemberIds, reactivateMemberIds };
			// currentMembers is read only when membersKey changes
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [membersKey]);

		const searchablePeople = useMemo(() => {
			const entries: SearchEntry[] = [];
			const directory: MaskedPerson[] = [];
			for (const person of people) {
				if (roster.occupiedMemberIds.has(person.id)) continue;
				entries.push({
					person,
					name: person.full_legal_name?.toLowerCase() ?? "",
					email: person.email?.toLowerCase() ?? "",
				});
				directory.push(person);
			}
			return { entries, directory };
		}, [people, roster]);

		const selectedIds = useMemo(
			() => new Set(selectedPeople.map((person) => person.id)),
			[selectedPeople],
		);

		// Query data is already account-holders first. Filter keeps that order.
		const filteredPeople = useMemo(() => {
			const term = debouncedSearch.trim().toLowerCase();
			if (!term) return searchablePeople.directory;
			const matches: MaskedPerson[] = [];
			for (const entry of searchablePeople.entries) {
				if (entry.name.includes(term) || entry.email.includes(term)) {
					matches.push(entry.person);
				}
			}
			return matches;
		}, [searchablePeople, debouncedSearch]);

		const togglePerson = useCallback((person: MaskedPerson) => {
			setSelectedPeople((current) => {
				const isSelected = current.some((item) => item.id === person.id);
				if (isSelected) return current.filter((item) => item.id !== person.id);
				return [
					...current,
					{ id: person.id, full_legal_name: person.full_legal_name },
				];
			});
		}, []);

		const renderPerson = useCallback(
			({ item }: { item: MaskedPerson }) => (
				<MemberResultRow
					person={item}
					selected={selectedIds.has(item.id)}
					onToggle={togglePerson}
				/>
			),
			[selectedIds, togglePerson],
		);

		const removePerson = (personId: number) => {
			setSelectedPeople(selectedPeople.filter((p) => p.id !== personId));
		};

		const handleAddMembers = async () => {
			if (selectedPeople.length === 0 || !user?.uid) return;

			try {
				const reactivateIds = selectedPeople
					.map((p) => p.id)
					.filter((id) => roster.reactivateMemberIds.has(id));

				const addedIds = selectedPeople.map((p) => p.id);

				await addMembers({
					cellId: cellId,
					people: selectedPeople as Person[],
					reactivateIds,
				});

				setSelectedPeople([]);
				setSearchTerm("");
				(ref as React.RefObject<BottomSheetModal>).current?.close();
				onSuccess?.(addedIds);
				Toast.show(
					myToast({
						success: true,
						message: `${addedIds.length} member${addedIds.length !== 1 ? "s" : ""} added successfully`,
					}),
				);
			} catch (error: any) {
				console.error("Error adding members:", error);
				Toast.show(
					myToast({
						success: false,
						message: error?.message || "Failed to add members",
					}),
				);
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
							extraData={selectedIds}
							keyExtractor={(item) => String(item.id)}
							renderItem={renderPerson}
							initialNumToRender={12}
							maxToRenderPerBatch={8}
							windowSize={7}
							keyboardShouldPersistTaps="handled"
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
