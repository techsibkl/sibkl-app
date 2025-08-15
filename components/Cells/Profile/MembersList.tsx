import { FlashList } from "@shopify/flash-list";
import { Search } from "lucide-react-native";
import React from "react";
import { TextInput, View } from "react-native";
import AddMemberButton from "./AddMemberButton";
import MemberRow from "./MemberRow";

type MembersListProps = {
  members: any[];
  searchQuery: string;
  onChangeText: (value: string) => void;
};

const MembersList = ({ members, searchQuery, onChangeText }: MembersListProps) => {
  return (
    <View className="flex-1">
      {/* Members list */}
      <FlashList
        data={members}
        keyExtractor={(item) => item.id}
        estimatedItemSize={70}
        contentContainerStyle={{
          paddingBottom: 40,
          paddingHorizontal: 16,
        }}
        ListHeaderComponent={
          <>
            {/* Search bar */}
            <View className="px-4 mb-4 flex-row items-center rounded-xl bg-white border border-border">
              <Search size={20} color="#999" />
              <TextInput
                className="flex-1 text-text-secondary text-base"
                placeholder="Search members..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={onChangeText}
              />
            </View>
          </>
        }
        renderItem={({ item, index }) => {
          if (index === 0) {
            return (
              <>
                <AddMemberButton />

                <MemberRow member={item} />
              </>
            );
          } else {
            return <MemberRow member={item} />;
          }
        }}
      />
    </View>
  );
};

export default MembersList;
