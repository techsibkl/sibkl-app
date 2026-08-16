import { featureFlags } from "@/config/featureFlags";
import { AnyAbility } from "@casl/ability";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Router } from "expo-router";
import React from "react";
import { FAB } from "react-native-paper";

type FABActionItem = React.ComponentProps<typeof FAB.Group>["actions"][number];

type getFabActionsProps = {
	ability: AnyAbility;
	router: Router;
	createSessionSheetModalRef: React.RefObject<BottomSheetModal | null>;
	cellId: number;
};

export const getFabActions = ({
	ability,
	router,
	createSessionSheetModalRef,
	cellId,
}: getFabActionsProps) => {
	const actions: (FABActionItem | false)[] = [
		featureFlags.cellAttendance &&
			ability.can("create", "CellSession") && {
				icon: "calendar",
				label: "New Session",
				labelTextColor: "black",
				onPress: () => createSessionSheetModalRef.current?.present(),
				color: "white",
				style: { backgroundColor: "#d6361e" },
			},
		ability.can("create", "CellMembers") && {
			icon: "account-plus",
			label: "Add Member",
			labelTextColor: "black",
			onPress: () => console.log("Add Member"),
			color: "white",
			style: { backgroundColor: "#d6361e" },
		},
		featureFlags.cellAttendance && {
			icon: "camera",
			label: "Mark Attendance",
			labelTextColor: "black",
			onPress: () =>
				router.push({
					pathname: "/(app)/cells/scanner",
					params: { cell_id: String(cellId) },
				}),
			color: "white",
			style: { backgroundColor: "#d6361e" },
		},
		featureFlags.cellAttendance &&
			ability.can("read", "CellSession") && {
				icon: "calendar-clock",
				label: "View Sessions",
				labelTextColor: "black",
				onPress: () =>
					router.push({
						pathname: "/(app)/cells/sessions",
						params: { cell_id: cellId },
					}),
				color: "white",
				style: { backgroundColor: "#d6361e" },
			},
	];

	return actions.filter((action): action is FABActionItem => Boolean(action));
};
