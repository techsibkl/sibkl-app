import { updatePeopleFlowSingleCustomAttr } from "@/services/Flow/flow.service";
import { SingleCustomAttr, StepAction } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { displayDateAsStr, myToast } from "@/utils/helper";
import { PencilIcon, User2Icon } from "lucide-react-native";
import React, { useState } from "react";
import { Text, View } from "react-native";
import Toast from "react-native-toast-message";

type Props = {
	action: StepAction;
	personFlow: PeopleFlow;
	custom_attr?: { [key: string]: SingleCustomAttr };
};
const ChangeFieldAction = ({ action, personFlow, custom_attr }: Props) => {
	const [menuVisible, setMenuVisible] = useState(false);

	const field = custom_attr?.[action.source];
	let changeValue = action.value ? String(action.value) : null;

	const updateField = async () => {
		const res = await updatePeopleFlowSingleCustomAttr(
			personFlow.flow_id ?? 1,
			personFlow,
			action.source,
			action.value,
			field?.label ?? ""
		);
		Toast.show(myToast(res));
	};

	return (
		<View
			// onPress={() => }
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
					{field?.label ?? "-"} {"> "}
					<Text className="font-medium text-gray-700">
						{displayDateAsStr(changeValue ?? "Edit")}
					</Text>
				</Text>
			</View>
			{changeValue && <PencilIcon onPress={updateField} size={16} />}
			{/* If not changeVal, need to open dynamic dialog to handle input (text, date, options) */}
		</View>
	);
};

export default ChangeFieldAction;
