import SharedBody from "@/components/shared/SharedBody";
import { groupedPersonFields } from "@/constants/const_person";
import { useSinglePersonQuery } from "@/hooks/People/useSinglePersonQuery";
import { useClaimStore } from "@/stores/claimStore";
import { SectionEnum } from "@/types/TableField.type";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  View,
  ScrollView,
} from "react-native";

const ProfileViewPage = () => {
  const { selectedProfile } = useClaimStore();
  const { data: person, isPending } = useSinglePersonQuery(selectedProfile?.id);

  if (isPending || !person)
    return (
      <SharedBody>
        <ActivityIndicator />
      </SharedBody>
    );

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <SharedBody>
        {/* Header */}
        <View className="items-center mt-16 mb-6">
          <Image
            source={require("../../../../assets/images/person.png")}
            className="w-20 h-20 rounded-xl"
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-text">My Profile</Text>
          <Text className="text-text-secondary mt-1 text-center">
            View your account details
          </Text>
        </View>

        <View className="px-5 pt-4">
          {Object.entries(groupedPersonFields)
            .filter(([section]) => section === SectionEnum.PERSONAL_INFORMATION)
            .map(([section, fields]) => (
              <View key={section} className="mb-12">
                <Text className="ml-1 mb-4 pb-2 text-black font-semibold border-b border-gray-300">
                  {section}
                </Text>

                {/* DISPLAY FIELDS */}
                <View className="gap-y-4">
                  {fields
                    .filter((f) => f.editable !== false)
                    .map((field) => {
                      const value = person[field.key] ?? "";

                      return (
                        <View
                          key={field.key}
                          className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                        >
                          <Text className="text-gray-500 text-xs mb-1">
                            {field.label}
                          </Text>
                          <Text className="text-black font-medium">
                            {value || "—"}
                          </Text>
                        </View>
                      );
                    })}
                </View>
              </View>
            ))}
        </View>
      </SharedBody>
    </ScrollView>
  );
};

export default ProfileViewPage;
