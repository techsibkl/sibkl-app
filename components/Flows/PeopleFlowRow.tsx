import { FlowStep, SingleCustomAttr } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { daysAgo } from "@/utils/helper";
import {
	daysAgoTextColorNative,
	getStepStatusStyleNative,
} from "@/utils/helper_flows";
import { useRouter } from "expo-router";
import { CircleDashedIcon, MoreVerticalIcon } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Menu } from "react-native-paper";
import AddNoteDialog from "../Notes/NotesDialog";
import SharedModal from "../shared/SharedModal";
import PeopleFlowDialog from "./PeopleFlowDialog";

type PeopleFlowRowProps = {
	personFlow: PeopleFlow;
	steps: { [key: string]: FlowStep };
	custom_attr: { [key: string]: SingleCustomAttr };
};

const PeopleFlowRowComponent = ({
	personFlow,
	steps,
	custom_attr,
}: PeopleFlowRowProps) => {
	const router = useRouter();
	const [modalVisible, setModalVisible] = useState(false);
	const [noteDialogVisible, setNoteDialogVisible] = useState(false);
	const [menuVisible, setMenuVisible] = useState(false);

	const _step = useMemo(() => {
		return personFlow.step_key ? steps[personFlow.step_key] : null;
	}, [personFlow.step_key, steps]);

	const goToProfile = useCallback(() => {
		router.push(`/people/profile/${personFlow.people_id}`);
	}, [personFlow.people_id, router]);

	const colors = getStepStatusStyleNative(personFlow.step_key, steps);

	return (
		<>
			<TouchableOpacity
				className=""
				onPress={() => setModalVisible(true)}
			>
				<View className="flex-col items-center py-4 border-b border-border-secondary">
					<View className="flex-row w-full mb-2 pr-2 justify-between items-center">
						<View
							className="px-3 py-1.5 rounded-full flex-row items-center gap-1 self-start"
							style={{ backgroundColor: colors.bg }}
						>
							<CircleDashedIcon size={12} color={colors.text} />
							<Text
								className="text-xs font-semibold"
								style={{ color: colors.text }}
							>
								{_step?.label ?? "Not Started"}
							</Text>
						</View>
						{/* Last Contacted */}

						<Text
							className="text-xs font-medium italic"
							style={{
								color: daysAgoTextColorNative(
									personFlow.last_contacted
								),
							}}
						>
							{daysAgo(personFlow.last_contacted)}
						</Text>
					</View>
					<View className="flex-row items-center justify-center gap-x-2">
						{/* Avatar */}
						<View className="w-12 h-12 rounded-full bg-background overflow-hidden">
							<Image
								source={require("../../assets/images/person.png")}
								className="w-full h-full"
								resizeMode="cover"
							/>
						</View>

						{/* Person Info */}
						<View className="flex-1 gap-y-1">
							<Text className="text-text dark:text-text-dark-primary font-semibold">
								{personFlow.p__full_name}
							</Text>
							<Text className="text-text-secondary text-sm">
								{personFlow.p__phone ?? "-"}
							</Text>
						</View>

						<Menu
							visible={menuVisible}
							contentStyle={{ backgroundColor: "white" }}
							onDismiss={() => setMenuVisible(false)}
							anchor={
								<TouchableOpacity
									onPress={() => setMenuVisible(true)}
								>
									<MoreVerticalIcon size={20} color="#999" />
								</TouchableOpacity>
							}
						>
							<Menu.Item
								onPress={() => {
									setMenuVisible(false);
									goToProfile();
									// Handle view profile
								}}
								title="View profile"
							/>
							{/* <Menu.Item
								onPress={() => {
									setMenuVisible(false);
									// Handle assign
								}}
								title="Assign"
							/> */}
							<Menu.Item
								onPress={() => {
									setMenuVisible(false);
									setNoteDialogVisible(true);
									// Handle add note
								}}
								title="Add note"
							/>
						</Menu>
					</View>
				</View>
			</TouchableOpacity>
			<SharedModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			>
				<PeopleFlowDialog
					onDismiss={() => setModalVisible(false)}
					personFlow={personFlow}
					step={_step}
					custom_attr={custom_attr}
					colors={colors}
				/>
			</SharedModal>
			<SharedModal
				visible={noteDialogVisible}
				onClose={() => setNoteDialogVisible(false)}
			>
				<AddNoteDialog
					onDismiss={() => setNoteDialogVisible(false)}
					personFlow={personFlow}
				/>
			</SharedModal>
		</>
	);
};

const PeopleFlowRow = React.memo(PeopleFlowRowComponent);
export default PeopleFlowRow;
