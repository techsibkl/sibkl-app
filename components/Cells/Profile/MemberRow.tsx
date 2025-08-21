import { Person } from "@/services/Person/person.type";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type MemberRowProps = {
  member: Person;
};

const MemberRow = ({ member }: MemberRowProps) => {
  const router = useRouter();
  return (
    <TouchableOpacity className="flex-row items-center py-3 px-4" onPress={() => router.push(`/(app)/people/profile/${member.id}`)}>
      <Image
        source={require("../../../assets/images/person.png")}
        className="w-12 h-12 rounded-full mr-4"
      />
      <View className="flex-1">
        <Text className="text-text font-semibold text-base">{member.full_name}</Text>
        <Text className="text-text-secondary text-sm mt-1">
          {member.phone}
        </Text>
      </View>
      <Text className="text-text-secondary text-sm">{member.role}</Text>
      <Text className="text-text-secondary ml-2">›</Text>
    </TouchableOpacity>
  );
};

export default MemberRow;
