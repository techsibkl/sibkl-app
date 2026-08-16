import { featureFlags } from "@/config/featureFlags";
import toastConfig from "@/config/toastConfig";
import { ActionComponents } from "@/constants/const_flows";
import {
	usePeopleFlowAllQuery,
	usePeopleFlowQuery,
} from "@/hooks/Flows/useFlowsQuery";
import { useAssignMutation } from "@/hooks/Flows/usePeopleFlowMutations";
import {
	FlowStep,
	SingleCustomAttr,
	StepAction,
} from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { fetchPeoplePaginated } from "@/services/Person/person.service";
import { Person } from "@/services/Person/person.type";
import { useAuthStore } from "@/stores/authStore";
import { Role } from "@/utils/casl/defineAbilityFor";
import { daysAgo, formatPhone } from "@/utils/helper";
import {
	daysAgoTextColorNative,
	getStepStatusStyleNative,
} from "@/utils/helper_flows";
import { getAvatarColors, getInitials } from "@/utils/helper_profile";
import { subject } from "@casl/ability";
import Clipboard from "@react-native-clipboard/clipboard";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
	ChevronUpIcon,
	CircleDashedIcon,
	CircleIcon,
	GitBranchIcon,
	InfoIcon,
	MapPinIcon,
	PhoneIcon,
	UserIcon,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
	Alert,
	Linking,
	Modal,
	ScrollView,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import Toast from "react-native-toast-message";
import AssignDistrictCellDialog from "./Assign/AssignDistrictCellDialog";
import AssignPersonDialog from "./Assign/AssignPersonDialog";
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
	flow_district_id?: number;
};

const PeopleFlowDialog = ({
	onDismiss,
	personFlow: personFlowProp,
	step: stepProp,
	steps,
	flow_id,
	flow_title,
	assignee_name,
	custom_attr,
	colors: colorsProp,
	flow_district_id,
}: PeopleFlowDialogProps) => {
	const [activeTab, setActiveTab] = useState<"action" | "notes">("action");
	const [assignPersonVisible, setAssignPersonVisible] = useState(false);
	const [assignDistrictCellVisible, setAssignDistrictCellVisible] =
		useState(false);
	const [showAssignMenu, setShowAssignMenu] = useState(false);

	const router = useRouter();
	const { ability, user } = useAuthStore();

	// Subscribe to both caches so field/step mutations refresh this open dialog
	// whether the user is on a selected flow or ALL FLOWS.
	const { data: singleFlowPeople } = usePeopleFlowQuery(flow_id);
	const { data: allPeople } = usePeopleFlowAllQuery();

	const personFlow = useMemo(() => {
		const match = (p: PeopleFlow) =>
			p.people_id === personFlowProp.people_id &&
			(p.flow_id ?? flow_id) === (personFlowProp.flow_id ?? flow_id);

		return (
			singleFlowPeople?.find(match) ??
			allPeople?.find(match) ??
			personFlowProp
		);
	}, [singleFlowPeople, allPeople, personFlowProp, flow_id]);

	const step = useMemo(() => {
		const key = personFlow.step_key ?? "not_started";
		return steps?.[key] ?? stepProp ?? null;
	}, [personFlow.step_key, steps, stepProp]);

	const colors = useMemo(
		() =>
			getStepStatusStyleNative(personFlow.step_key, steps) ?? colorsProp,
		[personFlow.step_key, steps, colorsProp],
	);

	const avatarColors = getAvatarColors(personFlow.status);
	const initials = getInitials(personFlow.p__full_legal_name);
	const effectiveAssignee =
		assignee_name ??
		personFlow.assignee_name ??
		personFlow.last_contacted_by_name ??
		null;

	// CASL + role derived permission flags
	const { canAssign, canAssignDistrict, canAssignCell } = useMemo(() => {
		if (!ability || !user?.person) {
			return {
				canAssign: false,
				canAssignDistrict: false,
				canAssignCell: false,
			};
		}
		const roles = user.person.roles || [];

		const isSuperRole = [
			Role.SENIOR_PASTOR,
			Role.SUPER_ADMIN,
			Role.PEOPLE_ADMIN,
		].some((r) => roles.includes(r));

		const isDistrictRole = [Role.DISTRICT_ADMIN, Role.DISTRICT_PASTOR].some(
			(r) => roles.includes(r),
		);

		const isCellLeader = roles.includes(Role.CELL_LEADER);

		const canAssignDistrict = isSuperRole || isDistrictRole;
		const canAssignCell =
			featureFlags.cellFollowUp &&
			(isSuperRole || isDistrictRole || isCellLeader);

		const canAssign = ability.can(
			"assign",
			subject("PeopleFlow", {
				district_id: personFlow.district_id,
				flow_district_id: flow_district_id,
				cell_ids: personFlow.assigned_cell_id
					? [personFlow.assigned_cell_id]
					: undefined,
				assignee_id: personFlow.assignee_id,
			}),
		);

		return { canAssign, canAssignDistrict, canAssignCell };
	}, [
		ability,
		user?.person,
		flow_district_id,
		personFlow.district_id,
		personFlow.assignee_id,
		personFlow.assigned_cell_id,
	]);

	// Derive how many assign options are available
	const assignOptionCount =
		(canAssignDistrict || canAssignCell ? 1 : 0) + (canAssign ? 1 : 0);
	const hasMultipleAssignOptions = assignOptionCount > 1;

	// Fetch CASL-scoped people list for assigning
	const { data: paginatedResponse } = useQuery({
		queryKey: ["people_paginated"],
		queryFn: () => fetchPeoplePaginated({ pageSize: 500 }),
	});
	const people = useMemo(
		() => paginatedResponse?.data || [],
		[paginatedResponse],
	);

	const { mutateAsync: assignMutation, isPending: isAssigning } =
		useAssignMutation(flow_id);

	const sendWhatsApp = async (person: PeopleFlow) => {
		const phone = formatPhone(person.p__phone);
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

	const handleAssignPerson = useCallback(
		async (person: Person) => {
			try {
				const res = await assignMutation({
					people: [
						{
							id: Number(personFlow.p__id),
							full_legal_name: personFlow.p__full_legal_name!,
						},
					],
					flow: { id: flow_id, title: flow_title },
					assignee_id: person.id,
					assigneeName: person.full_legal_name,
				});
				if (res.success) {
					setAssignPersonVisible(false);
				}
			} catch {
				Alert.alert("Error", "Failed to assign person");
			}
		},
		[personFlow, flow_id, flow_title, assignMutation],
	);

	const handleAssignPress = () => {
		if (hasMultipleAssignOptions) {
			setShowAssignMenu(true);
		} else if (canAssignDistrict || canAssignCell) {
			setAssignDistrictCellVisible(true);
		} else if (canAssign) {
			setAssignPersonVisible(true);
		}
	};

	const anyCanAssign = canAssign || canAssignDistrict || canAssignCell;

	return (
		<View className="h-full w-full bg-white rounded-[15px] overflow-hidden">
			<ScrollView
				style={{ flex: 1 }}
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
						className="flex-row py-1.5 px-6 rounded-full items-center justify-center gap-2"
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

					{/* Assignee row */}
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
					{/* Cell row */}
					{featureFlags.cellFollowUp && (
						<View className="flex-row items-center gap-2">
							<CircleIcon size={13} color="#9ca3af" />
							{personFlow.cell_name ? (
								<Text
									className="text-xs text-gray-500 flex-1"
									numberOfLines={1}
								>
									{personFlow.cell_name}
								</Text>
							) : (
								<Text className="text-xs text-gray-400 italic">
									No cell
								</Text>
							)}
						</View>
					)}
					{/* District row */}
					<View className="flex-row items-center gap-2">
						<MapPinIcon size={13} color="#9ca3af" />
						{personFlow.district_name ? (
							<Text
								className="text-xs text-gray-500 flex-1"
								numberOfLines={1}
							>
								{personFlow.district_name}
							</Text>
						) : (
							<Text className="text-xs text-gray-400 italic">
								No district
							</Text>
						)}
					</View>

					{/* Last contacted row */}
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

				{/* Tabs */}
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
					<View className="gap-y-4 flex flex-col w-full px-6 mt-5">
						{step?.actions && step.actions.length > 0 ? (
							<>
								{/* Info Box */}
								<View className="flex-row gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
									<InfoIcon
										size={16}
										color="#6b7280"
										className="mt-0.5"
									/>
									<Text className="flex-1 text-xs text-gray-600 leading-5">
										Actions are set by your admin to guide
										your follow-up process. Once completed
										all preset actions, change the person
										status if necessary.
									</Text>
								</View>
								{/* Actions */}
								{step.actions.map((action, i) => {
									const Component =
										ActionComponents[action.type];
									if (!Component) return null;
									return (
										<View key={i}>
											<Text className="text-xs font-semibold text-gray-500 mb-2">
												Action {i + 1}
											</Text>
											<Component
												action={
													action as unknown as StepAction
												}
												personFlow={personFlow}
												custom_attr={custom_attr}
												steps={steps}
												flow_id={flow_id}
												flow_district_id={
													flow_district_id
												}
												onSuccess={onDismiss}
											/>
										</View>
									);
								})}
							</>
						) : (
							<View className="flex-row gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
								<InfoIcon
									size={16}
									color="#3b82f6"
									className="mt-0.5"
								/>
								<Text className="flex-1 text-xs text-blue-600 leading-5">
									No actions to complete for this step.
								</Text>
							</View>
						)}
					</View>
				) : (
					<NotesTab personFlow={personFlow} />
				)}
			</ScrollView>

			{/* Bottom action bar */}
			<View className="border-t border-border flex-row">
				<TouchableOpacity
					onPress={onDismiss}
					className="flex-1 py-5 items-center justify-center"
				>
					<Text className="text-gray-500">Back</Text>
				</TouchableOpacity>
				<View className="w-px bg-border" />
				<TouchableOpacity
					onPress={handleAssignPress}
					disabled={isAssigning || !anyCanAssign}
					className="flex-1 py-5 items-center justify-center flex-row gap-1"
				>
					<Text
						className={`font-semibold ${
							anyCanAssign && !isAssigning
								? "text-blue-600"
								: "text-gray-400"
						}`}
					>
						{isAssigning ? "Assigning..." : "Assign"}
					</Text>
					{hasMultipleAssignOptions &&
						anyCanAssign &&
						!isAssigning && (
							<ChevronUpIcon size={14} color="#2563eb" />
						)}
				</TouchableOpacity>
			</View>

			{/* Assign options menu (bottom sheet overlay) */}
			<Modal
				visible={showAssignMenu}
				transparent
				animationType="fade"
				onRequestClose={() => setShowAssignMenu(false)}
			>
				<TouchableWithoutFeedback
					onPress={() => setShowAssignMenu(false)}
				>
					<View className="flex-1 bg-black/40 justify-end">
						<TouchableWithoutFeedback>
							<View className="bg-white rounded-t-2xl pb-6 pt-2">
								<View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />
								<Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-6 mb-2">
									Assign
								</Text>

								{(canAssignDistrict || canAssignCell) && (
									<TouchableOpacity
										onPress={() => {
											setShowAssignMenu(false);
											setAssignDistrictCellVisible(true);
										}}
										className="flex-row items-center gap-3 px-6 py-4 border-b border-gray-100"
									>
										<View className="w-9 h-9 rounded-full bg-purple-100 items-center justify-center">
											<MapPinIcon
												size={16}
												color="#7c3aed"
											/>
										</View>
										<View>
											<Text className="font-semibold text-text text-sm">
												{canAssignDistrict &&
												canAssignCell
													? "Assign District / Cell"
													: canAssignDistrict
														? "Assign District"
														: "Assign Cell"}
											</Text>
											<Text className="text-xs text-gray-400">
												{canAssignDistrict &&
												canAssignCell
													? "Assign to a district and/or cell"
													: canAssignDistrict
														? "Assign to a district"
														: "Assign to a cell"}
											</Text>
										</View>
									</TouchableOpacity>
								)}

								{canAssign && (
									<TouchableOpacity
										onPress={() => {
											setShowAssignMenu(false);
											setAssignPersonVisible(true);
										}}
										className="flex-row items-center gap-3 px-6 py-4 border-b border-gray-100"
									>
										<View className="w-9 h-9 rounded-full bg-blue-100 items-center justify-center">
											<UserIcon
												size={16}
												color="#2563eb"
											/>
										</View>
										<View>
											<Text className="font-semibold text-text text-sm">
												Assign Person
											</Text>
											<Text className="text-xs text-gray-400">
												Assign a follow-up person
											</Text>
										</View>
									</TouchableOpacity>
								)}

								<TouchableOpacity
									onPress={() => setShowAssignMenu(false)}
									className="mx-6 mt-4 py-3 bg-gray-100 rounded-xl items-center"
								>
									<Text className="text-gray-600 font-semibold">
										Cancel
									</Text>
								</TouchableOpacity>
							</View>
						</TouchableWithoutFeedback>
					</View>
				</TouchableWithoutFeedback>
			</Modal>

			{/* Assign Person Dialog */}
			<AssignPersonDialog
				visible={assignPersonVisible}
				onDismiss={() => setAssignPersonVisible(false)}
				onAssign={handleAssignPerson}
				people={people}
				loading={isAssigning}
				priorityCellId={personFlow.assigned_cell_id}
				priorityDistrictId={personFlow.district_id}
				currentAssignee={
					assignee_name
						? ({ id: 0, full_legal_name: assignee_name } as Person)
						: null
				}
			/>

			{/* Assign District / Cell Dialog */}
			<AssignDistrictCellDialog
				visible={assignDistrictCellVisible}
				onDismiss={() => setAssignDistrictCellVisible(false)}
				personFlow={personFlow}
				flow_id={flow_id}
				flow_title={flow_title}
				showDistrictTab={canAssignDistrict}
				showCellTab={canAssignCell}
			/>
			{/* Renders Toast above this modal's layer */}
			<Toast config={toastConfig} />
		</View>
	);
};

export default PeopleFlowDialog;
