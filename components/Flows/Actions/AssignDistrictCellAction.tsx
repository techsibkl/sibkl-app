import HelpDialog from "@/components/shared/HelpDialog";
import SharedModal from "@/components/shared/SharedModal";
import { StepAction } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import {
	ArrowRight,
	CircleIcon,
	HelpCircle,
	MapPinIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import AssignDistrictCellDialog from "../Assign/AssignDistrictCellDialog";

type Props = {
	action: StepAction;
	personFlow: PeopleFlow;
	flow_id: number;
	onSuccess?: () => void;
};

const AssignDistrictCellAction = ({
	action,
	personFlow,
	flow_id,
	onSuccess,
}: Props) => {
	const [dialogVisible, setDialogVisible] = useState(false);
	const [helpVisible, setHelpVisible] = useState(false);

	const scope = action.value ?? "both";
	const showDistrictTab = scope !== "cell";
	const showCellTab = scope !== "district";

	const scopeLabel =
		scope === "district"
			? "District"
			: scope === "cell"
				? "Cell"
				: "District / Cell";

	return (
		<View>
			<View className="flex-row items-center gap-2">
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => setDialogVisible(true)}
					className="flex-1 flex-row items-center gap-3 bg-white p-4 rounded-xl border border-border"
				>
					<View className="p-2 rounded-full bg-blue-100">
						<CircleIcon size={18} color="#1d4ed8" />
					</View>

					<View className="flex-1 gap-0.5">
						<View className="flex-row items-center">
							<Text className="text-gray-800 font-bold">
								Assign {scopeLabel}
							</Text>
							<Pressable
								onPress={() => setHelpVisible(true)}
								className="p-2"
							>
								<HelpCircle size={12} color="#9ca3af" />
							</Pressable>
						</View>
						<View className="flex-row flex-wrap gap-x-3 gap-y-0.5 ">
							{personFlow.district_name ? (
								<View className="flex-row items-center gap-1">
									<MapPinIcon size={11} color="#9ca3af" />
									<Text className="text-xs text-gray-400">
										{personFlow.district_name}
									</Text>
								</View>
							) : showDistrictTab ? (
								<Text className="text-xs text-gray-400 italic">
									No district assigned
								</Text>
							) : null}
							{personFlow.cell_name ? (
								<View className="flex-row items-center gap-1">
									<CircleIcon size={11} color="#9ca3af" />
									<Text className="text-xs text-gray-400">
										{personFlow.cell_name}
									</Text>
								</View>
							) : showCellTab ? (
								<Text className="text-xs text-gray-400 italic">
									No cell assigned
								</Text>
							) : null}
						</View>
					</View>

					<ArrowRight size={18} />
				</TouchableOpacity>
			</View>

			<AssignDistrictCellDialog
				visible={dialogVisible}
				onDismiss={() => {
					setDialogVisible(false);
					onSuccess?.();
				}}
				personFlow={personFlow}
				flow_id={flow_id}
				showDistrictTab={showDistrictTab}
				showCellTab={showCellTab}
			/>

			<SharedModal
				visible={helpVisible}
				onClose={() => setHelpVisible(false)}
			>
				<HelpDialog
					title={`Assign ${scopeLabel}`}
					description={`Assign this person to a ${scopeLabel.toLowerCase()} so the right team can follow up. The assignment will be visible to all leaders in that ${scopeLabel.toLowerCase()}.`}
				/>
			</SharedModal>
		</View>
	);
};

export default AssignDistrictCellAction;
