import { Person } from "@/services/Person/person.type";
import { getInitials } from "@/utils/helper_profile";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type PeopleRowProps = {
	person: Person;
	isMe?: boolean;
};

const PeopleRowComponent = ({ person, isMe }: PeopleRowProps) => {
	const router = useRouter();

	const handlePress = useCallback(() => {
		router.push({
			pathname: "/(app)/profile/[id]",
			params: { id: person.id, backPath: "/(app)/people" }, // Pass the current path as backPath
		});
	}, [person.id, router]);

	return (
		<TouchableOpacity
			key={person.id}
			// style={styles.row}
			className="flex-row items-center py-4 border-b border-border-secondary gap-2"
			onPress={handlePress}
			activeOpacity={0.7}
		>
			{/* Color-coded avatar with initials */}
			<View className="w-11 h-11 rounded-full bg-gray-200 items-center justify-center">
				<Text className="text-sm font-bold">
					{getInitials(person.full_legal_name)}
				</Text>
			</View>

			{/* Person Info */}
			<View className="flex-1">
				<Text
					// style={styles.name}
					className="text-text font-semibold mb-1"
				>
					{person.full_legal_name} {isMe ? "(You)" : ""}
				</Text>
				<Text
					// style={styles.phone}
					className="text-text-secondary text-sm"
				>
					{person.phone ?? "-"}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

const PeopleRow = React.memo(PeopleRowComponent);
export default PeopleRow;
