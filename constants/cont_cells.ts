import { AnyAbility } from "@casl/ability";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Router } from "expo-router";
import React from "react";

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
  return [
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
      onPress: () =>
        router.push({
          pathname: "/(app)/cells/scanner",
          params: { cell_id: String(cellId) },
        }),
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
  ].filter(Boolean);
};
