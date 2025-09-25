import { Cell } from "@/services/Cell/cell.types";
import { useRouter } from "expo-router";
import { ChevronRight, Users } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type CellCardProps = {
	cell: Cell;
};

const CellCard = ({ cell }: CellCardProps) => {
	const router = useRouter();

	return (
		<TouchableOpacity
			className="rounded-2xl p-5 mb-4 bg-white"
			style={{
				shadowRadius: 5, // Override the default blur
				shadowOpacity: 0.05,
			}}
			onPress={() => router.push(`/cells/profile/${cell.id}`)}
			activeOpacity={0.8}
		>
			<View className=" flex-row">
				<View className="flex-1 space-y-3">
					<View className="flex-row items-center justify-center flex-1 ">
						<View className="w-12 h-12 rounded-full justify-center items-center mr-4 bg-primary-500">
							<Users size={24} color="white" />
						</View>
						<View className="flex-1">
							<Text className="text-lg font-semibold text-text mb-1">
								{cell.cell_name}
							</Text>
							<Text className="text-xs text-text-secondary">
								Leader: {cell.cell_leader_1_name}
							</Text>
						</View>
					</View>
				</View>
				<View className="items-center justify-center">
					<TouchableOpacity className="w-10 h-10 rounded-full bg-white/30 justify-center items-center border border-white/20 border-dashed flex">
						<ChevronRight size={24} color="#666" />
					</TouchableOpacity>
				</View>
			</View>
		</TouchableOpacity>
	);
};

export default CellCard;
