import { MaskedPerson } from "@/services/Person/person.type";
import { useClaimStore } from "@/stores/claimStore";
import { claimConfidence } from "@/utils/claimSuggestion";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function ProfileItem({ item }: { item: MaskedPerson }) {
	const router = useRouter();
	const claimStore = useClaimStore();
	const confidence = claimConfidence(item);
	const suggested = confidence !== "none";
	//   const [showConfirm, setShowConfirm] = useState(false);

	const handlePress = () => {
		Alert.alert(
			"Check Ownership",
			`Continue to claim this profile "${item.full_legal_name}"?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Continue",
					onPress: () => {
						// Optionally store the selected profile in a Zustand store
						// useClaimStore.getState().setSelectedProfile(item);
						claimStore.setSelectedProfile(item as MaskedPerson);
						router.push("/(auth)/selected-account");
					},
				},
			],
		);
	};

	return (
		<TouchableOpacity
			className={`rounded-[15px] p-4 mt-2 border ${
				confidence === "high"
					? "bg-amber-50 border-amber-400"
					: "bg-card border-border"
			}`}
			onPress={handlePress}
		>
			<View className="flex-row items-center gap-2">
				<Text className="font-semibold text-lg text-text shrink" numberOfLines={1}>
					{item.full_legal_name}
				</Text>
				{suggested ? (
					<View className="rounded-full bg-amber-100 px-2 py-0.5">
						<Text className="text-[11px] font-medium text-amber-800">Suggested</Text>
					</View>
				) : null}
			</View>
			<Text className="text-sm text-text-secondary">{item.email}</Text>
			<Text className="text-sm text-text-secondary">{item.phone}</Text>
		</TouchableOpacity>
	);
}
