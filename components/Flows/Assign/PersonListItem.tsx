import { Person } from "@/services/Person/person.type";
import { getInitials } from "@/utils/helper_profile";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type PersonListItemProps = {
	person: Person;
	selected: boolean;
	onPress: () => void;
};

const PersonListItem = ({ person, selected, onPress }: PersonListItemProps) => (
	<TouchableOpacity
		onPress={onPress}
		className={`px-4 py-3 border-b border-border flex-row items-center justify-between ${
			selected ? "bg-blue-50" : ""
		}`}
	>
		<View className="flex-row items-center flex-1">
			<View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
				<Text className="text-xs font-bold text-text">
					{getInitials(person.full_legal_name)}
				</Text>
			</View>
			<View className="flex-1">
				<View className="flex-row items-center gap-2">
					<Text
						className="font-semibold text-text text-sm shrink"
						numberOfLines={1}
					>
						{person.full_legal_name}
					</Text>
					{person.has_account ? (
						<View className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5">
							<Text className="text-[11px] font-medium text-emerald-700">
								Has account
							</Text>
						</View>
					) : null}
				</View>
				{person.phone ? (
					<Text className="text-xs text-gray-500 mt-0.5">{person.phone}</Text>
				) : null}
			</View>
		</View>
		{selected && <Text className="text-blue-600 font-bold">✓</Text>}
	</TouchableOpacity>
);

export default PersonListItem;
