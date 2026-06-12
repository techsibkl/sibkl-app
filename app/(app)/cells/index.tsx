"use client";

import CellList from "@/components/Cells/CellList";
import CreateSessionSheet from "@/components/Cells/CreateSessionSheet";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { getFabActions } from "@/constants/cont_cells";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Cell } from "@/services/Cell/cell.types";
import { useAuthStore } from "@/stores/authStore";
import React, {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StatusBar, Text, View } from "react-native";
import { FAB, Portal, Provider } from "react-native-paper";

const CellsScreen = () => {
  const { isDark } = useThemeColors();
  const { user, ability } = useAuthStore();
  const { data: person } = useSinglePersonQuery(user?.person?.id ?? -1);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const ledCells: number[] = person?.leader_of_cell_ids;
  const ledCellsFormatted = (person?.cells ?? []) // ← use same source
    .filter((cell) => cell.id && ledCells.map(Number).includes(Number(cell.id)))
    .map((cell) => ({ id: cell.id!, name: cell.cell_name! }));

  // ref
  const createSessionSheetModalRef = useRef<BottomSheetModal>(null);
  // console.log("user:", user);
  // console.log("firebaseUser:", firebaseUser);
  const filteredCells = (person?.cells ?? []).filter((cell: Cell) =>
    cell?.cell_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  // // derive filtered list
  // const filteredCells = (user?.person?.cells ?? []).filter((cell: Cell) =>
  // 	cell?.cell_name?.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  useEffect(() => {
    if (!person) return;
    const cells = person.cells ?? [];

    if (cells.length === 1) {
      router.replace({
        pathname: "/(app)/cells/profile/[id]",
        params: { id: cells[0].id! },
      });
    }
  }, [person]);

  if (!user)
    return (
      <SharedBody>
        <Text>Unauthenticated</Text>
        <Text>Go Away!!!!</Text>
      </SharedBody>
    );

  return (
    <SharedBody>
      <StatusBar
        className="bg-background dark:bg-background-dark"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <SharedSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search cells..."
      />

      {/* Content */}
      <View className="flex-1">
        <CellList cells={filteredCells} />
      </View>

      <BottomSheetModalProvider>
        <Provider>
          {/* existing content */}
          <Portal>
            <FAB.Group
              open={open}
              icon={open ? "close" : "plus"}
              color="white"
              fabStyle={{ backgroundColor: "#d6361e" }} // Tailwind red-500
              visible
              actions={getFabActions({
                ability: ability,
                router: router,
                createSessionSheetModalRef: createSessionSheetModalRef,
                cellId: ledCellsFormatted[0]?.id,
              })}
              onStateChange={({ open }) => setOpen(open)}
            />
            <CreateSessionSheet
              ref={createSessionSheetModalRef}
              ledCells={ledCellsFormatted}
            />
          </Portal>
        </Provider>
      </BottomSheetModalProvider>
    </SharedBody>
  );
};

export default CellsScreen;
