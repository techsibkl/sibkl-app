import { Person } from "@/services/Person/person.type";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, X } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";

type MemberRowProps = {
	member: Person;
	isLeader?: boolean;
	memberStatuses?: Record<number, string>;
	onAccept?: (memberId: number) => void;
	onReject?: (memberId: number) => void;
	isUpdating?: boolean;
};

const MemberRow = ({ 
	member, 
	isLeader = false,
	memberStatuses = {},
	onAccept,
	onReject,
	isUpdating = false,
}: MemberRowProps) => {
	const router = useRouter();
	const { id } = useLocalSearchParams();

	const memberStatus = memberStatuses[member.id] || member.status || "ACTIVE";

	const getStatusColor = () => {
		switch (memberStatus) {
			case "ACTIVE":
				return "bg-green-100 text-green-700";
			case "PENDING":
				return "bg-yellow-100 text-yellow-700";
			case "REJECTED":
				return "bg-red-100 text-red-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	const handleMemberPress = () => {
		router.push({
			pathname: "/(app)/profile/[id]",
			params: {
				id: member.id,
				backPath: `/(app)/cells/profile/${id}`,
			},
		});
	};

	return (
		<View className="flex-row items-center py-3 px-4 bg-white mb-2 rounded-lg mx-3">
			<Image
				source={require("../../../assets/images/person.png")}
				className="w-12 h-12 rounded-full mr-4"
			/>
		<TouchableOpacity
			className="flex-1"
			onPress={handleMemberPress}
		>
			<View className="flex-row items-center gap-2">
				<Text className="text-text font-semibold text-base">
					{member.full_legal_name}
				</Text>
				{/* Status Badge */}
				<View className={`px-2 py-0.5 rounded-full ${getStatusColor()}`}>
					<Text
						className={`font-semibold tracking-wide ${getStatusColor().split(' ')[1]}`}
						style={{ fontSize: 10 }}
					>
						{memberStatus.toUpperCase()}
					</Text>
				</View>
			</View>
			<Text className="text-text-secondary text-sm mt-1">
				{member.phone}
			</Text>
		</TouchableOpacity>

		{/* Accept/Reject Buttons or Loading (only for leaders on pending members) */}
			{isLeader && memberStatus === "PENDING" && (
				<View className="flex-row gap-2">
					{isUpdating ? (
						<View className="w-9 h-9 items-center justify-center">
							<ActivityIndicator size="small" color="#10b981" />
						</View>
					) : (
						<>
							<TouchableOpacity
								disabled={isUpdating}
								className={`${isUpdating ? "opacity-50" : ""} bg-red-400 w-9 h-9 rounded-full items-center justify-center`}
								onPress={() => onReject?.(member.id)}
							>
								<X size={18} color="white" strokeWidth={2.5} />
							</TouchableOpacity>
							<TouchableOpacity
								disabled={isUpdating}
								className={`${isUpdating ? "opacity-50" : ""} bg-green-400 w-9 h-9 rounded-full items-center justify-center`}
								onPress={() => onAccept?.(member.id)}
							>
								<Check size={18} color="white" strokeWidth={2.5} />
							</TouchableOpacity>
						</>
					)}
				</View>
			)}
		</View>
	);
};

export default MemberRow;
