import { Person } from "@/services/Person/person.type";
import { getInitials } from "@/utils/helper_profile";
import { useLocalSearchParams } from "expo-router";
import { Check, Crown, StarIcon, X } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import MemberActionSheet from "./MemberActionSheet";

type MemberRowProps = {
	member: Person;
	isLeader?: boolean;
	currentPersonId?: number;
	memberStatuses?: Record<number, string>;
	onAccept?: (memberId: number) => void;
	onReject?: (memberId: number) => void;
	isUpdating?: boolean;
	onRemoveMember?: (memberId: number) => void;
	onCoreToggled?: () => void;
	isCellLeader?: boolean;
};

const MemberRow = ({
	member,
	isLeader = false,
	currentPersonId,
	memberStatuses = {},
	onAccept,
	onReject,
	isUpdating = false,
	onRemoveMember,
	onCoreToggled,
	isCellLeader = false,
}: MemberRowProps) => {
	const { id } = useLocalSearchParams();
	const [modalVisible, setModalVisible] = useState(false);

	const memberStatus = memberStatuses[member.id] || member.status || "ACTIVE";
	const isCurrentUser =
		currentPersonId != null && member.id === currentPersonId;

	const handleMemberPress = () => {
		if (isCurrentUser) return;
		setModalVisible(true);
	};

	return (
		<>
			<TouchableOpacity
				onPress={handleMemberPress}
				disabled={isCurrentUser}
				activeOpacity={isCurrentUser ? 1 : 0.6}
			>
				<View className="flex-col px-4 py-4 border-b border-border-secondary">
					{/* Main row: avatar + info + status/actions */}
					<View className="flex-row items-center gap-x-3">
						{/* Color-coded avatar with initials */}
						<View className="w-11 h-11 rounded-full bg-gray-200 items-center justify-center">
							<Text className="text-sm font-bold text-text">
								{getInitials(member.full_legal_name)}
							</Text>
						</View>

						{/* Name, phone, and badges */}
						<View className="flex-1 gap-y-1">
							<View className="flex-row items-center gap-1">
								<Text
									className="text-text font-semibold"
									numberOfLines={1}
								>
									{member.full_legal_name}{" "}
									{isCurrentUser ? "(You)" : ""}
								</Text>
							</View>
							<View className="flex-row items-center gap-1">
								<Text
									className="text-text-secondary text-sm"
									numberOfLines={1}
								>
									{member.phone ?? "-"}
								</Text>
							</View>
						</View>

						<View>
							{isCellLeader && (
								<View className="bg-blue-100 px-2 py-0.5 rounded-full flex-row items-center gap-0.5">
									<Crown size={12} color="#1e40af" />
									<Text className="text-xs font-semibold text-blue-700">
										Leader
									</Text>
								</View>
							)}
							{!!member?.is_core && (
								<View className="px-2 py-1 rounded-full bg-amber-100 flex-row items-center gap-1">
									<StarIcon size={12} color="#d97706" />
									<Text className="text-xs font-semibold text-amber-700">
										CORE
									</Text>
								</View>
							)}
						</View>

						{/* Accept/Reject Buttons or Chevron */}
						{isLeader && memberStatus === "PENDING" && (
							<View className="flex-row gap-2">
								{isUpdating ? (
									<View className="w-9 h-9 items-center justify-center">
										<ActivityIndicator
											size="small"
											color="#10b981"
										/>
									</View>
								) : (
									<>
										<TouchableOpacity
											disabled={isUpdating}
											className={`${isUpdating ? "opacity-50" : ""} bg-red-400 w-9 h-9 rounded-full items-center justify-center`}
											onPress={() =>
												onReject?.(member.id)
											}
										>
											<X
												size={18}
												color="white"
												strokeWidth={2.5}
											/>
										</TouchableOpacity>
										<TouchableOpacity
											disabled={isUpdating}
											className={`${isUpdating ? "opacity-50" : ""} bg-green-400 w-9 h-9 rounded-full items-center justify-center`}
											onPress={() =>
												onAccept?.(member.id)
											}
										>
											<Check
												size={18}
												color="white"
												strokeWidth={2.5}
											/>
										</TouchableOpacity>
									</>
								)}
							</View>
						)}
					</View>
				</View>
			</TouchableOpacity>

			<MemberActionSheet
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				member={member}
				cellId={Number(id)}
				isLeader={isLeader}
				currentPersonId={currentPersonId}
				onRemove={onRemoveMember}
				onCoreToggled={onCoreToggled}
			/>
		</>
	);
};

export default MemberRow;
