import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import React, { forwardRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import MembersList from "./MembersList";

type SearchMembersModalProps = {
	members: any[];
	memberStatuses?: Record<number, string>;
	isLeader?: boolean;
	currentPersonId?: number;
	isUpdating?: number | null;
	onAccept?: (memberId: number) => void;
	onReject?: (memberId: number) => void;
	onRemoveMember?: (memberId: number) => void;
};

const SearchMembersModal = forwardRef<
	BottomSheetModal,
	SearchMembersModalProps
>(
	(
		{
			members,
			memberStatuses = {},
			isLeader = false,
			currentPersonId,
			isUpdating = null,
			onAccept,
			onReject,
			onRemoveMember,
		},
		ref,
	) => {
		const [searchQuery, setSearchQuery] = useState("");

		const filteredMembers = (members ?? []).filter((member: any) =>
			member?.full_legal_name
				?.toLowerCase()
				.includes(searchQuery.toLowerCase()),
		);

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
				<View className="flex-1 bg-white flex-col rounded-[15px]">
					{/* Header with search input and close button */}
					<View className="py-4 border-b border-gray-200">
						<View className="px-6 mb-3 flex-row items-center justify-between">
							<Text className="text-lg font-semibold text-gray-900">
								Search Members
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

						<SharedSearchBar
							unstyled
							searchQuery={searchQuery}
							onSearchChange={setSearchQuery}
							placeholder="Search by name or phone..."
						/>
					</View>

					{/* Reuse MembersList with search functionality */}
					<MembersList
						members={members}
						searchQuery={searchQuery}
						isLeader={isLeader}
						currentPersonId={currentPersonId}
						memberStatuses={memberStatuses}
						onAccept={onAccept}
						onReject={onReject}
						isUpdating={isUpdating}
						onRemoveMember={onRemoveMember}
					/>
				</View>
			</BottomSheetModal>
		);
	},
);

SearchMembersModal.displayName = "SearchMembersModal";

export default SearchMembersModal;
