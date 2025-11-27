// AddToFlowAction.tsx

import { StepAction } from "@/services/Flow/flow.types";
import { ArrowRight, FunnelPlusIcon } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
	action: StepAction;
};
const AddToFlowAction = ({ action }: Props) => {
	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={() => {}}
			className="flex-row items-center gap-3 bg-white p-4 rounded-xl shadow"
		>
			<View className="p-2 rounded-full bg-purple-100">
				<FunnelPlusIcon size={18} color={"#512da8"} />
			</View>

			<View className="flex-1">
				<Text className="text-gray-800 font-semibold">Add to flow</Text>

				<Text className="text-gray-500 text-sm mt-1">
					{action.value
						? `Flow ID: ${action.value}`
						: "Select target flow"}
				</Text>
			</View>

			<ArrowRight size={18} />
		</TouchableOpacity>
	);
};

export default AddToFlowAction;
