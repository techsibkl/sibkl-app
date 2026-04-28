import { ActionComponents } from "@/constants/const_flows";
import { FlowStep, SingleCustomAttr } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { daysAgo, formatPhone } from "@/utils/helper";
import { daysAgoTextColorNative } from "@/utils/helper_flows";
import { getAvatarColors, getInitials } from "@/utils/helper_profile";
import Clipboard from "@react-native-clipboard/clipboard";
import { useRouter } from "expo-router";
import {
	CircleDashedIcon,
	GitBranchIcon,
	PhoneIcon,
	UserIcon,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
	Alert,
	Linking,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import NotesTab from "./NotesTab";

type PeopleFlowDialogProps = {
	onDismiss: () => void;
	personFlow: PeopleFlow;
	step?: FlowStep | null;
	steps: { [key: string]: FlowStep };
	flow_id: number;
	flow_title?: string;
	assignee_name?: string;
	custom_attr?: { [key: string]: SingleCustomAttr };
	colors: { bg: string; text: string };
};

const PeopleFlowDialog = ({
	onDismiss,
	personFlow,
	step,
	steps,
	flow_id,
	flow_title,
	assignee_name,
	custom_attr,
	colors,
}: PeopleFlowDialogProps) => {
	const [activeTab, setActiveTab] = useState<"action" | "notes">("action");
	const avatarColors = getAvatarColors(personFlow.status);
	const initials = getInitials(personFlow.p__full_legal_name);
	const effectiveAssignee =
		assignee_name ?? personFlow.last_contacted_by_name ?? null;
	const router = useRouter();

	const sendWhatsApp = async (person: PeopleFlow) => {
		let phone = formatPhone(person.p__phone);
		const url = `https://wa.me/${phone}?text=Hello%20${encodeURIComponent(person.p__full_legal_name!)},`;
		await Linking.openURL(url);
	};

	const copyPhoneToClipboard = useCallback((phone: string | undefined) => {
		if (!phone) {
			Alert.alert("Error", "No phone number available");
			return;
		}
		Clipboard.setString(phone);
	}, []);

	const goToProfile = useCallback(() => {
		router.push({
			pathname: "/(app)/profile/[id]",
			params: { id: Number(personFlow.p__id), backPath: "/(app)/flows" },
		});
		onDismiss();
	}, [personFlow.p__id, router, onDismiss]);

	return (
		<View className="h-full w-full bg-white rounded-[15px] overflow-hidden">
			<ScrollView
				style={{
					flex: 1,
				}}
				contentContainerStyle={{
					paddingBottom: 20,
					flexGrow: 1,
					alignItems: "center",
				}}
				showsVerticalScrollIndicator={false}
			>
				{/* Status badge */}
				<View className="flex-col items-center px-6 pt-6 gap-2">
					<View
						className="flex-row py-1.5 px-6  rounded-full items-center justify-center gap-2"
						style={{ backgroundColor: colors.bg }}
					>
						<CircleDashedIcon size={12} color={colors.text} />
						<Text
							className="font-semibold"
							style={{ color: colors.text }}
						>
							{step?.label ?? "Not Started"}
						</Text>
					</View>
					<Text
						className="text-gray-600 text-center text-sm"
						numberOfLines={4}
						ellipsizeMode="tail"
					>
						{step?.description ?? "No description available"}
					</Text>
				</View>

				{/* Avatar + name + phone - Horizontal compact layout */}
				<TouchableOpacity onPress={() => goToProfile()}>
					<View className="mt-4 px-6 flex-row items-center justify-center gap-3">
						<View
							className="w-14 h-14 rounded-full items-center justify-center flex-shrink-0"
							style={{ backgroundColor: avatarColors.bg }}
						>
							<Text
								className="text-lg font-bold"
								style={{ color: avatarColors.text }}
							>
								{initials}
							</Text>
						</View>
						<View>
							<Text
								className="text-text text-lg font-bold"
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{personFlow.p__full_legal_name}
							</Text>
							<Text
								className="text-blue-600 text-sm"
								numberOfLines={1}
								onPress={() => sendWhatsApp(personFlow)}
								onLongPress={() =>
									copyPhoneToClipboard(
										formatPhone(personFlow.p__phone),
									)
								}
							>
								{formatPhone(personFlow.p__phone) ?? "-"}
							</Text>
						</View>
					</View>
				</TouchableOpacity>

				{/* Compact meta info strip */}
				<View className="mx-6 mt-4 bg-gray-50 rounded-2xl px-4 py-3 gap-y-2 w-[80%]">
					{flow_title && (
						<View className="flex-row items-center gap-2">
							<GitBranchIcon size={13} color="#9ca3af" />
							<Text
								className="text-xs text-gray-500 flex-1"
								numberOfLines={1}
							>
								{flow_title}
							</Text>
						</View>
					)}
					<View className="flex-row items-center gap-2 ">
						<UserIcon size={13} color="#9ca3af" />
						{effectiveAssignee ? (
							<Text
								className="text-xs text-gray-500 flex-1"
								numberOfLines={1}
							>
								{effectiveAssignee}
								{personFlow.last_assigned_at && (
									<Text className="text-gray-400 italic">
										{" · assigned "}
										{daysAgo(personFlow.last_assigned_at)}
									</Text>
								)}
							</Text>
						) : (
							<Text className="text-xs text-gray-400 italic">
								No assignee
							</Text>
						)}
					</View>
					<View className="flex-row items-center gap-2">
						<PhoneIcon size={13} color="#9ca3af" />
						{personFlow.last_contacted ? (
							<Text className="text-xs text-gray-500">
								Last contacted{" · "}
								<Text
									className="italic"
									style={{
										color: daysAgoTextColorNative(
											personFlow.last_contacted,
										),
									}}
								>
									{daysAgo(personFlow.last_contacted)}
								</Text>
							</Text>
						) : (
							<Text className="text-xs text-gray-400 italic">
								No last contacted
							</Text>
						)}
					</View>
				</View>

				{/* Modern Tabs */}
				<View className="flex-row px-6 mt-5 gap-1 border-b border-border">
					<TouchableOpacity
						className={`flex-1 py-3 px-3 rounded-t-xl items-center justify-center transition ${
							activeTab === "action"
								? "bg-blue-50 border-b-2 border-blue-600"
								: ""
						}`}
						onPress={() => setActiveTab("action")}
					>
						<Text
							className={`font-semibold text-sm ${
								activeTab === "action"
									? "text-blue-600"
									: "text-gray-500"
							}`}
						>
							Action
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						className={`flex-1 py-3 px-3 rounded-t-xl items-center justify-center transition ${
							activeTab === "notes"
								? "bg-blue-50 border-b-2 border-blue-600"
								: ""
						}`}
						onPress={() => setActiveTab("notes")}
					>
						<Text
							className={`font-semibold text-sm ${
								activeTab === "notes"
									? "text-blue-600"
									: "text-gray-500"
							}`}
						>
							Notes
						</Text>
					</TouchableOpacity>
				</View>

				{/* Tab Content */}
				{activeTab === "action" ? (
					<View className="gap-y-2 flex flex-col w-full px-6 mt-5">
						{step?.actions?.map((action, i) => {
							const Component = ActionComponents[action.type];
							if (!Component) return null;
							return (
								<Component
									key={i}
									action={action}
									personFlow={personFlow}
									custom_attr={custom_attr}
									steps={steps}
									flow_id={flow_id}
									onSuccess={onDismiss}
								/>
							);
						})}
					</View>
				) : (
					<NotesTab personFlow={personFlow} />
				)}
			</ScrollView>

			{/* Back */}
			<TouchableOpacity
				className="w-full py-5 items-center justify-center border-t border-border"
				onPress={onDismiss}
			>
				<Text className="text-gray-500">Back</Text>
			</TouchableOpacity>
		</View>
	);
};

export default PeopleFlowDialog;
