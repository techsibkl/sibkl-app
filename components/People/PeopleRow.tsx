import { InfoIcon } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

type PeopleRowProps = {
  person: any;
};

const PeopleRow = ({ person }: PeopleRowProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      key={person.id}
      className="flex-row items-center py-3 border-b border-gray-800 0"
      onPress={() => router.push(`/people/profile/${person.id}`)}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full bg-gray-600 mr-4 overflow-hidden">
        <Image
          source={{ uri: person.avatar }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Person Info */}
      <View className="flex-1">
        <Text className="text-text dark:text-text-dark-primary text-base font-medium mb-1">
          {person.fullName}
        </Text>
        <Text className="text-text-secondary text-sm">{person.phone}</Text>
      </View>

      {/* Info Button */}
      <TouchableOpacity className="p-2">
        <InfoIcon size={20} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default PeopleRow;
