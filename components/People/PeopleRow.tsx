import { Person } from "@/services/Person/person.type";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type PeopleRowProps = {
	person: Person;
};

const PeopleRowComponent = ({ person }: PeopleRowProps) => {
	const router = useRouter();

	const handlePress = useCallback(() => {
		router.push(`/people/profile/${person.id}`);
	}, [person.id, router]);

	return (
		<TouchableOpacity
			key={person.id}
			// style={styles.row}
			className="flex-row items-center py-4 border-b border-border-secondary 0"
			onPress={handlePress}
			activeOpacity={0.7}
		>
			{/* Avatar */}
			<View
				// style={styles.avatar}
				className="w-12 h-12 rounded-full bg-background mr-4 overflow-hidden"
			>
				<Image
					source={require("../../assets/images/person.png")}
					className="w-full h-full"
					resizeMode="cover"
				/>
			</View>

			{/* Person Info */}
			<View className="flex-1">
				<Text
					// style={styles.name}
					className="text-text dark:text-text-dark-primary text-base font-medium mb-1"
				>
					{person.full_name}
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
