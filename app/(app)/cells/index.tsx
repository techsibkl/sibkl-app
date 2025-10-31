"use client";

import CellList from "@/components/Cells/CellList";
import CreateSessionSheet from "@/components/Cells/CreateSessionSheet";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Cell } from "@/services/Cell/cell.types";
import { useAuthStore } from "@/stores/authStore";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import { StatusBar, Text, View } from "react-native";
import { FAB, Portal, Provider } from "react-native-paper";

const CellsScreen = () => {
  const { isDark } = useThemeColors();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ref
  const createSessionSheetModalRef = useRef<BottomSheetModal>(null);

  // // derive filtered list
  const filteredCells = (user?.person?.cells ?? []).filter((cell: Cell) =>
    cell?.cell_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              actions={[
                {
                  icon: "calendar",
                  label: "New Session",
                  onPress: () => createSessionSheetModalRef.current?.present(),
                  color: "white",
                  style: { backgroundColor: "#d6361e" },
                },
                {
                  icon: "account-plus",
                  label: "Add Member",
                  onPress: () => console.log("Add Member"),
                  color: "white",
                  style: { backgroundColor: "#d6361e" },
                },
                {
                  icon: "camera",
                  label: "Mark Attendance",
                  onPress: () => console.log("Opening Scanner"),
                  color: "white",
                  style: { backgroundColor: "#d6361e" },
                },
              ]}
              onStateChange={({ open }) => setOpen(open)}
            />
            <CreateSessionSheet
              ref={createSessionSheetModalRef}
              
            />
          </Portal>
        </Provider>
      </BottomSheetModalProvider>
    </SharedBody>
  );
};

export default CellsScreen;
