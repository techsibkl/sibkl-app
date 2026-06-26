import { FAB } from "react-native-paper";
import { AnyAbility } from "@casl/ability";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Router } from "expo-router";
import React from "react";

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
    ability.can("create", "CellSession") && {
      icon: "calendar",
      label: "New Session",
      onPress: () => createSessionSheetModalRef.current?.present(),
      color: "white",
      style: { backgroundColor: "#d6361e" },
    },
    ability.can("create", "CellMembers") && {
      icon: "account-plus",
      label: "Add Member",
      onPress: () => console.log("Add Member"),
      color: "white",
      style: { backgroundColor: "#d6361e" },
    },
    ability.can("read", "CellDetails") && {
      icon: "camera",
      label: "Mark Attendance",
      onPress: () => router.push("/(app)/cells/scanner"),
      color: "white",
      style: { backgroundColor: "#d6361e" },
    },
    ability.can("read", "CellSession") && {
      icon: "calendar-clock",
      label: "View Sessions",
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
