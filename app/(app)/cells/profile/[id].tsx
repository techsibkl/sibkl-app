"use client";

import CreateSessionSheet from "@/components/Cells/CreateSessionSheet";
import MembersList from "@/components/Cells/Profile/MembersList";
import ComingSoon from "@/components/shared/ComingSoon";
import SharedBody from "@/components/shared/SharedBody";
import { getFabActions } from "@/constants/cont_cells";
import { useSingleCellQuery } from "@/hooks/Cell/useSingleCellQuery";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { Person } from "@/services/Person/person.type";
import { useAuthStore } from "@/stores/authStore";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FAB, Portal, Provider } from "react-native-paper";

const CellProfileScreen = () => {
  const router = useRouter();
  const { isDark } = useThemeColors();
  const { id } = useLocalSearchParams();
  const { user, ability } = useAuthStore();
  const { data: person } = useSinglePersonQuery(user?.person?.id ?? -1);
  const {
    data: cell,
    isPending,
    error,
    isError,
  } = useSingleCellQuery(Number(id));

  const [activeTab, setActiveTab] = useState<
    "people" | "announcements" | "attendance"
  >("people");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const createSessionSheetModalRef = useRef<BottomSheetModal>(null);

  const ledCells: number[] = person?.leader_of_cell_ids;
  const ledCellsFormatted = (person?.cells ?? []) // ← use same source
    .filter((cell) => cell.id && ledCells.map(Number).includes(Number(cell.id)))
    .map((cell) => ({ id: cell.id!, name: cell.cell_name! }));

  const filteredMembers = (cell?.members ?? []).filter((member: Person) =>
    member?.full_legal_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "people":
        return (
          <MembersList
            members={filteredMembers}
            searchQuery={searchQuery}
            onChangeText={setSearchQuery}
          />
        );
      case "announcements":
        return <ComingSoon description="Announcements coming soon" />;
      case "attendance":
        return <ComingSoon description="Attendance tracking coming soon" />;
      default:
        return null;
    }
  };

  if (isPending)
    return (
      <SharedBody>
        <ActivityIndicator />
      </SharedBody>
    );
  if (isError)
    return (
      <SharedBody>
        <Text>Type of Id: {typeof id}</Text>
        <Text>{error.message + "ID: " + id}</Text>
        <Text>{error.name}</Text>
      </SharedBody>
    );

  return (
    <SharedBody>
      <StatusBar
        className="bg-background"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <ScrollView>
        {/* Cell info section */}
        <View className="items-center py-8">
          <View className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center mb-6">
            <Text className="text-white text-2xl font-bold">tc</Text>
          </View>
          <Text className="text-text text-2xl font-bold text-center mb-2">
            {cell.cell_name}
          </Text>
          <Text className="text-text-secondary text-base">
            Cell • {cell.members?.length} member
            {cell.members?.length === 1 ? "" : "s"}
          </Text>
        </View>

        <Text>{Array.isArray(cell.members)}</Text>

        {/* Tab bar */}
        <View className="flex-row mx-6 mb-6">
          {["people", "announcements", "attendance"].map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-3 ${
                tab === "people"
                  ? "rounded-l-lg border border-border"
                  : tab === "attendance"
                    ? "rounded-r-lg border border-border"
                    : " border-t border-b border-border"
              } ${activeTab === tab ? "bg-background" : "bg-background-secondary"}`}
              onPress={() => setActiveTab(tab as typeof activeTab)}
            >
              <Text
                className={`text-center text-sm text-nowrap font-medium ${
                  activeTab === tab ? "text-text" : "text-text-secondary"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderTabContent()}
      </ScrollView>

      <BottomSheetModalProvider>
        <Provider>
          <Portal>
            <FAB.Group
              open={open}
              icon={open ? "close" : "plus"}
              color="white"
              fabStyle={{ backgroundColor: "#d6361e" }}
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

export default CellProfileScreen;
