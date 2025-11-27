import { defaultPersonFields } from "@/constants/const_person";
import { StepAction } from "@/services/Flow/flow.types";
import { displayDateAsStr } from "@/utils/helper";
import { PencilIcon, User2Icon } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
	action: StepAction;
};
const ChangeFieldAction = ({ action }: Props) => {
	const fieldMeta = defaultPersonFields?.find((f) => f.key === action.source);

	const fieldLabel = fieldMeta?.header ?? "Unknown Field";

	let displayValue = "-";

	if (
		action.value !== undefined &&
		action.value !== null &&
		action.value !== ""
	) {
		// Convert values safely (string, boolean, array, number)
		if (Array.isArray(action.value)) {
			displayValue = action.value.join(", ");
		} else if (typeof action.value === "boolean") {
			displayValue = action.value ? "Yes" : "No";
		} else {
			displayValue = String(action.value);
		}
	}

	return (
		<TouchableOpacity
			onPress={() => {}}
			className="flex-row items-center gap-3 bg-white p-4 rounded-xl shadow"
		>
			<View className="p-2 rounded-full bg-blue-100">
				<User2Icon size={18} color={"#383e8eff"} />
			</View>

			<View className="flex-1">
				<Text className="text-gray-800 font-semibold">
					Edit profile
				</Text>

				<Text className="text-gray-500 text-sm mt-1">
					{fieldLabel} {"> "}
					<Text className="font-medium text-gray-700">
						{displayDateAsStr(displayValue)}
					</Text>
				</Text>
			</View>

			<PencilIcon size={16} />
		</TouchableOpacity>
	);
};

export default ChangeFieldAction;
