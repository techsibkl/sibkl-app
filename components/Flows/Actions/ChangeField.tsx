import SharedModal from "@/components/shared/SharedModal";
import { SingleCustomAttr, StepAction } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { displayDateAsStr, powerEqual } from "@/utils/helper";
import { CheckCircleIcon, PencilIcon, User2Icon } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import StepActionDetailDialog from "./DetailDialog";

type Props = {
	action: StepAction;
	personFlow: PeopleFlow;
	custom_attr?: { [key: string]: SingleCustomAttr };
};

const isCompleted = (action: StepAction, personFlow: PeopleFlow): boolean => {
	const currentValue = personFlow.custom_attr?.[action.source];
	if (
		action.value !== undefined &&
		action.value !== null &&
		action.value !== ""
	) {
		return powerEqual(currentValue, action.value);
	}
	return (
		currentValue !== undefined &&
		currentValue !== null &&
		currentValue !== ""
	);
};

const ChangeFieldAction = ({ action, personFlow, custom_attr }: Props) => {
	const [modalVisible, setModalVisible] = useState(false);

	const field = custom_attr?.[action.source];
	const done = isCompleted(action, personFlow);

	// Title: "Update <field label>" or "Update field" if no label
	const title = `${field?.label ?? "field"}`;

	// Subtitle right side: if action has a target value show it, else show current value, else "Edit"
	const currentValue = personFlow.custom_attr?.[action.source];
	const displayValue = action.value
		? displayDateAsStr(String(action.value))
		: currentValue
			? displayDateAsStr(String(currentValue))
			: "Edit";

	return (
		<>
			<TouchableOpacity
				onPress={() => setModalVisible(true)}
				activeOpacity={0.7}
				className={`flex-row items-center gap-3 p-4 rounded-xl border ${
					done
						? "bg-green-50 border-green-200"
						: "bg-white border-border"
				}`}
			>
				{/* Icon — always profile icon, color reflects done state */}
				<View
					className={`p-2 rounded-full ${done ? "bg-green-100" : "bg-blue-100"}`}
				>
					<User2Icon
						size={18}
						color={done ? "#16a34a" : "#383e8eff"}
					/>
				</View>

				{/* Label + value */}
				<View className="flex-1">
					<Text
						className={`font-bold ${done ? "text-green-700" : "text-gray-800"}`}
					>
						{title}
					</Text>
					<Text
						className={`text-sm mt-1 ${done ? "text-green-600" : "text-gray-500"}`}
					>
						{"Set answer to"}
						{" > "}
						<Text
							className={`font-medium ${done ? "text-green-700" : "text-gray-700"}`}
						>
							{displayValue}
						</Text>
					</Text>
					<Text
						className={`text-xs max-lines-1 italic ${done ? "text-green-600" : "text-gray-500"}`}
					>
						{"Current: " +
							(currentValue
								? displayDateAsStr(currentValue)
								: "Not set")}
					</Text>
				</View>

				{/* Right indicator */}
				{done ? (
					<CheckCircleIcon size={18} color="#16a34a" />
				) : (
					!action.value &&
					!currentValue && <PencilIcon size={16} color="#9ca3af" />
				)}
			</TouchableOpacity>

			<SharedModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			>
				<StepActionDetailDialog
					onDismiss={() => setModalVisible(false)}
					onSuccess={() => setModalVisible(false)}
					action={action}
					personFlow={personFlow}
					custom_attr={custom_attr}
				/>
			</SharedModal>
		</>
	);
};

export default ChangeFieldAction;
