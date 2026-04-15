import { ActionComponents } from "@/constants/const_flows";
import { FlowStep, SingleCustomAttr } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { daysAgo, formatPhone } from "@/utils/helper";
import { daysAgoTextColorNative } from "@/utils/helper_flows";
import { getAvatarColors, getInitials } from "@/utils/helper_profile";
import { useRouter } from "expo-router";
import {
	CircleDashedIcon,
	GitBranchIcon,
	PhoneIcon,
	UserIcon,
} from "lucide-react-native";
import React, { useCallback } from "react";
import {
	Linking,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

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

	const goToProfile = useCallback(() => {
		router.push({
			pathname: "/(app)/profile/[id]",
			params: { id: Number(personFlow.p__id), backPath: "/(app)/flows" }, // Pass the current path as backPath
		});
		onDismiss();
	}, [personFlow.p__id, router]);

	return (
		<View className="h-full w-full bg-white rounded-[15px] overflow-hidden">
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Status badge */}
				<View className="flex-col px-16 pt-6 gap-2">
					<View
						className="flex-row py-1.5 rounded-full items-center justify-center gap-2"
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

				{/* Avatar + name + phone */}
				<TouchableOpacity onPress={() => goToProfile()}>
					<View className="mt-4 px-16 items-center gap-1">
						<View
							className="w-20 h-20 rounded-full items-center justify-center mb-1"
							style={{ backgroundColor: avatarColors.bg }}
						>
							<Text
								className="text-2xl font-bold"
								style={{ color: avatarColors.text }}
							>
								{initials}
							</Text>
						</View>
						<Text
							className="text-text text-xl font-bold"
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{personFlow.p__full_legal_name}
						</Text>
						<Text
							className="text-blue-600"
							numberOfLines={1}
							onPress={() => sendWhatsApp(personFlow)}
						>
							{personFlow.p__phone ?? "-"}
						</Text>
					</View>
				</TouchableOpacity>

				{/* Compact meta info strip */}
				<View className="mx-6 mt-4 bg-gray-50 rounded-2xl px-4 py-3 gap-y-2">
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
					<View className="flex-row items-center gap-2">
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

				{/* Actions */}
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
							/>
						);
					})}
				</View>
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
