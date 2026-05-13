import SharedBody from "@/components/shared/SharedBody";
import SkeletonPeopleRow from "@/components/shared/Skeleton/SkeletonPeopleRow";
import { groupedPersonFields } from "@/constants/const_person";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { useAuthStore } from "@/stores/authStore";
import { SectionEnum } from "@/types/TableField.type";
import { displayDateAsStr } from "@/utils/helper";
import { getInitials } from "@/utils/helper_profile";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const ProfileViewPage = () => {
	const { user, isGuest } = useAuthStore();
	const { data: person, isPending } = useSinglePersonQuery(
		user?.person?.id ?? -1,
	);
	const router = useRouter();

	// Guest user profile page
	if (isGuest) {
		return (
			<SharedBody>
				<View className="flex-1 justify-center items-center px-6">
					<View className="w-24 h-24 rounded-full bg-gray-300 items-center justify-center mb-6">
						<Text className="text-4xl font-bold text-gray-600">
							G
						</Text>
					</View>
					<Text className="text-2xl text-text font-bold mb-2">
						Guest User
					</Text>
					<Text className="font-regular text-text-secondary text-center mb-8">
						Sign in to access your profile and additional features
					</Text>
					<TouchableOpacity
						onPress={() => router.replace("/(auth)/sign-in")}
						className="bg-blue-600 px-6 py-3 rounded-lg"
					>
						<Text className="text-white font-semibold text-center">
							Sign In
						</Text>
					</TouchableOpacity>
				</View>
			</SharedBody>
		);
	}

	if (isPending || !person)
		return (
			<SharedBody>
				<SkeletonPeopleRow />
			</SharedBody>
		);

	const formatValue = (value: any) => {
		if (value instanceof Date) {
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
					<View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center">
						<Text className="text-lg  font-bold">
							{getInitials(person.full_legal_name)}
						</Text>
					</View>
					<Text className="text-2xl text-text font-bold">
						{`${person.full_legal_name}`}
					</Text>
					<Text className="font-regular text-text-secondary text-center">
						View your account details
					</Text>
					<TouchableOpacity
						onPress={() =>
							router.push("/(app)/home/profile/updateProfile")
						}
					>
						<Text className="font-semibold text-sm text-blue-500">
							Edit Profile
						</Text>
					</TouchableOpacity>
				</View>

				<View className="px-5 pt-4">
					{Object.entries(groupedPersonFields)
						.filter(
							([section]) =>
								section === SectionEnum.PERSONAL_INFORMATION,
						)
						.map(([section, fields]) => (
							<View key={section} className="mb-12">
								<Text className="ml-1 pb-2 mb-4 text-lg font-bold text-text border-b border-gray-300">
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
													<Text className="font-regular text-gray-500 text-xs mb-1">
														{field.header}
													</Text>
													<Text className="font-medium text-text">
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
