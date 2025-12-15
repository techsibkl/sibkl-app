import SharedBody from "@/components/shared/SharedBody";
import SkeletonPeopleRow from "@/components/shared/Skeleton/SkeletonPeopleRow";
import { groupedPersonFields } from "@/constants/const_person";
import { useSinglePersonQuery } from "@/hooks/People/useSinglePersonQuery";
import { useAuthStore } from "@/stores/authStore";
import { SectionEnum } from "@/types/TableField.type";
import { displayDateAsStr } from "@/utils/helper";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const ProfileViewPage = () => {
	const { user } = useAuthStore();
	const { data: person, isPending } = useSinglePersonQuery(user?.people_id);
	const router = useRouter();

	if (isPending || !person)
		return (
			<SharedBody>
				<SkeletonPeopleRow />
			</SharedBody>
		);

	const formatValue = (value: any) => {
		if (value instanceof Date || typeof value === "string") {
			return displayDateAsStr(value);
		}

		// Handle nested objects (JSON fields)
		if (typeof value === "object" && value !== null) {
			return JSON.stringify(value, null, 2);
		}

		return value ?? "—";
	};

	return (
		<ScrollView
			contentContainerStyle={{ flexGrow: 1 }}
			keyboardShouldPersistTaps="handled"
		>
			<SharedBody>
				{/* Header */}
				<View className="items-center mb-6 gap-1">
					<Image
						source={require("../../../../assets/images/person.png")}
						className="w-20 h-20 rounded-xl"
						resizeMode="contain"
					/>
					<Text className="text-2xl font-bold">
						{`${person.full_name}`}
					</Text>
					<Text className="text-text-secondary text-center">
						View your account details
					</Text>
					<TouchableOpacity
						onPress={() =>
							router.push("/(app)/home/profile/updateProfile")
						}
					>
						<Text className="text-sm text-blue-500">
							Edit Profile
						</Text>
					</TouchableOpacity>
				</View>

				<View className="px-5 pt-4">
					{Object.entries(groupedPersonFields)
						.filter(
							([section]) =>
								section === SectionEnum.PERSONAL_INFORMATION
						)
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
											const rawValue =
												person[field.key] ?? "";
											const formattedValue =
												formatValue(rawValue);

											return (
												<View
													key={field.key}
													className="bg-gray-50 p-4 rounded-xl border border-gray-200"
												>
													<Text className="text-gray-500 text-xs mb-1">
														{field.header}
													</Text>
													<Text className="text-black font-medium">
														{formattedValue || "—"}
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
