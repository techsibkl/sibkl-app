import SharedModal from "@/components/shared/SharedModal";
import { SingleCustomAttr, StepAction } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { displayDateAsStr } from "@/utils/helper";
import { PencilIcon, User2Icon } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import StepActionDetailDialog from "./DetailDialog";

type Props = {
	action: StepAction;
	personFlow: PeopleFlow;
	custom_attr?: { [key: string]: SingleCustomAttr };
};
const ChangeFieldAction = ({ action, personFlow, custom_attr }: Props) => {
	const [modalVisible, setModalVisible] = useState(false);

	const field = custom_attr?.[action.source];
	let changeValue = action.value ? String(action.value) : null;

	return (
		<>
			<TouchableOpacity
				onPress={() => setModalVisible(true)}
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
				{!changeValue && <PencilIcon size={16} />}
				{/* If not changeVal, need to open dynamic dialog to handle input (text, date, options) */}
			</TouchableOpacity>
			<SharedModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			>
				<StepActionDetailDialog
					onDismiss={() => setModalVisible(false)}
					action={action}
					personFlow={personFlow}
					custom_attr={custom_attr}
				/>
			</SharedModal>
		</>
	);
};

export default ChangeFieldAction;
