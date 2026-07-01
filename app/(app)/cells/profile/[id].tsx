"use client";

import CreateSessionSheet from "@/components/Cells/CreateSessionSheet";
import MembersList from "@/components/Cells/Profile/MembersList";
import ComingSoon from "@/components/shared/ComingSoon";
import SharedBody from "@/components/shared/SharedBody";
import { getFabActions } from "@/constants/cont_cells";
import { useSingleCellQuery } from "@/hooks/Cell/useSingleCellQuery";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { useThemeColors } from "@/hooks/useThemeColor";
import { removeCellMembers, updateMemberStatus } from "@/services/Cell/cell.service";
import { Person } from "@/services/Person/person.type";
import { useAuthStore } from "@/stores/authStore";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
  // console.log("person:", person);

  const ledCells: number[] | undefined = person?.leader_of_cell_ids;
  const isLeader = ledCells?.map(Number).includes(Number(id));
  
  // Only fetch from API if user is a leader
  const {
    data: cellFromApi,
    isPending,
    error: queryError,
    isError,
    refetch,
  } = useSingleCellQuery(Number(id));

  // Get cell data from person's cells for regular members
  // const cellFromPerson = person?.cells?.find(c => c.id === Number(id));
  
  // Use API data for leaders, fallback to person data for members
  const cell = cellFromApi;

  const [activeTab, setActiveTab] = useState<
    "people" | "announcements" | "attendance"
  >("people");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [memberStatuses, setMemberStatuses] = useState<Record<number, string>>({});
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const createSessionSheetModalRef = useRef<BottomSheetModal>(null);

  const ledCellsFormatted = (person?.cells ?? [])
    .filter((cell) => cell.id && ledCells?.map(Number).includes(Number(cell.id)))
    .map((cell) => ({ id: cell.id!, name: cell.cell_name! }));

  const filteredMembers = (cell?.members ?? []).filter((member: Person) =>
    member?.full_legal_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAcceptMember = async (memberId: number) => {
    try {
      setIsUpdating(memberId);
      setStatusError(null);

      await updateMemberStatus(Number(id), memberId, "ACTIVE");

      setMemberStatuses((prev) => ({
        ...prev,
        [memberId]: "ACTIVE",
      }));
    } catch (err: any) {
      setStatusError(err.message || "Failed to accept member");
      console.error("Accept member error:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRejectMember = async (memberId: number) => {
    try {
      setIsUpdating(memberId);
      setStatusError(null);

      await updateMemberStatus(Number(id), memberId, "REJECTED");

      setMemberStatuses((prev) => ({
        ...prev,
        [memberId]: "REJECTED",
      }));
    } catch (err: any) {
      setStatusError(err.message || "Failed to reject member");
      console.error("Reject member error:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  // Remove member, not yet implemented
  const handleRemoveMember = async (memberId: number) => {
    try {
      console.log("Removing member with ID:", memberId);
      setIsUpdating(memberId);
      setStatusError(null);

      await removeCellMembers(Number(id), [memberId], person?.id ?? -1);

      // console.log("Current user:", user);
      // console.log("User person ID:", user?.person?.id);
      
      // Refetch the cell data to update members list
      await refetch();
    } catch (err: any) {
      setStatusError(err.message || "Failed to remove member");
      console.error("Remove member error:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "people":
        return (
          <MembersList
            members={isLeader ? filteredMembers : filteredMembers.filter((m) => (memberStatuses[m.id] || m.status || "ACTIVE") === "ACTIVE")}
            searchQuery={searchQuery}
            onChangeText={setSearchQuery}
            isLeader={isLeader}
            memberStatuses={memberStatuses}
            onAccept={handleAcceptMember}
            onReject={handleRejectMember}
            isUpdating={isUpdating}
            onRemoveMember={handleRemoveMember}
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

  if (isPending && isLeader)
    return (
      <SharedBody>
        <ActivityIndicator />
      </SharedBody>
    );
  if (isError && isLeader)
    return (
      <SharedBody>
        <Text>Type of Id: {typeof id}</Text>
        <Text>{queryError?.message + "ID: " + id}</Text>
        <Text>{queryError?.name}</Text>
      </SharedBody>
    );

  if (!cell)
    return (
      <SharedBody>
        <Text>Cell not found</Text>
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

        {statusError && (
          <View className="bg-red-100 p-3 mx-3 rounded-lg mb-3">
            <Text className="text-red-700 text-sm">{statusError}</Text>
          </View>
        )}

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
              backdropColor="transparent"
              visible={activeTab === "attendance"}
              style={{
                paddingBottom: 0, // Sometimes there's default padding you might want to remove
                bottom: 10,       // Adjust this value to move it up or down (default is usually around 16)
                right: 16,        // Adjust this to move it left or right
              }}
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
