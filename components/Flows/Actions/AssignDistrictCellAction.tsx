import { featureFlags } from "@/config/featureFlags";
import HelpDialog from "@/components/shared/HelpDialog";
import SharedModal from "@/components/shared/SharedModal";
import { StepAction } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import {
	ArrowRight,
	CheckCircleIcon,
	CircleIcon,
	HelpCircle,
	MapPinIcon,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import AssignDistrictCellDialog from "../Assign/AssignDistrictCellDialog";

type Props = {
	action: StepAction;
	personFlow: PeopleFlow;
	flow_id: number;
	onSuccess?: () => void;
};

const isAssignmentComplete = (
	scope: string,
	personFlow: PeopleFlow,
): boolean => {
	if (scope === "district") {
		return !!personFlow.district_name;
	}
	if (scope === "cell") {
		return !!personFlow.cell_name;
	}
	return !!personFlow.district_name || !!personFlow.cell_name;
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
	const showCellTab = featureFlags.cellFollowUp && scope !== "district";

	const scopeLabel =
		showDistrictTab && showCellTab
			? "District / Cell"
			: showDistrictTab
				? "District"
				: "Cell";

	const done = useMemo(() => {
		if (showDistrictTab && showCellTab) {
			return isAssignmentComplete("both", personFlow);
		}
		if (showDistrictTab) {
			return isAssignmentComplete("district", personFlow);
		}
		return isAssignmentComplete("cell", personFlow);
	}, [showDistrictTab, showCellTab, personFlow]);

	if (!showDistrictTab && !showCellTab) {
		return null;
	}

	return (
		<View>
			<View className="flex-row items-center gap-2">
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => setDialogVisible(true)}
					className={`flex-1 flex-row items-center gap-3 p-4 rounded-xl border ${
						done
							? "bg-green-50 border-green-200"
							: "bg-white border-border"
					}`}
				>
					<View
						className={`p-2 rounded-full ${done ? "bg-green-100" : "bg-blue-100"}`}
					>
						<CircleIcon
							size={18}
							color={done ? "#16a34a" : "#1d4ed8"}
						/>
					</View>

					<View className="flex-1 gap-0.5">
						<View className="flex-row items-center">
							<Text
								className={`font-bold ${done ? "text-green-700" : "text-gray-800"}`}
							>
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
									<MapPinIcon
										size={11}
										color={done ? "#16a34a" : "#9ca3af"}
									/>
									<Text
										className={`text-xs ${done ? "text-green-600" : "text-gray-400"}`}
									>
										{personFlow.district_name}
									</Text>
								</View>
							) : showDistrictTab ? (
								<Text
									className={`text-xs italic ${done ? "text-green-600" : "text-gray-400"}`}
								>
									No district assigned
								</Text>
							) : null}
							{personFlow.cell_name ? (
								<View className="flex-row items-center gap-1">
									<CircleIcon
										size={11}
										color={done ? "#16a34a" : "#9ca3af"}
									/>
									<Text
										className={`text-xs ${done ? "text-green-600" : "text-gray-400"}`}
									>
										{personFlow.cell_name}
									</Text>
								</View>
							) : showCellTab ? (
								<Text
									className={`text-xs italic ${done ? "text-green-600" : "text-gray-400"}`}
								>
									No cell assigned
								</Text>
							) : null}
						</View>
					</View>

					{done ? (
						<CheckCircleIcon size={18} color="#16a34a" />
					) : (
						<ArrowRight size={18} />
					)}
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
