import { MaskedPerson } from "@/services/Person/person.type";
import { useClaimStore } from "@/stores/claimStore";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Text, TouchableOpacity } from "react-native";

export default function ProfileItem({ item }: { item: any }) {
  const router = useRouter();
  const claimStore = useClaimStore();
  //   const [showConfirm, setShowConfirm] = useState(false);

  const handlePress = () => {
    Alert.alert(
      "Confirm Account Claim",
      `Do you want to claim "${item.full_name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            // Optionally store the selected profile in a Zustand store
            // useClaimStore.getState().setSelectedProfile(item);
            claimStore.setSelectedProfile(item as MaskedPerson);
            router.push("/(auth)/selected-account");
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      className="bg-card rounded-[15px] p-4 mb-3 border border-border"
      onPress={handlePress}
    >
      <Text className="font-semibold text-lg text-text">{item.full_name}</Text>
      <Text className="text-sm text-text-secondary">{item.email}</Text>
      <Text className="text-sm text-text-secondary">{item.phone}</Text>
    </TouchableOpacity>
  );
}
