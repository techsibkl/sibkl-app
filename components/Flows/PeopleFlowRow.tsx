import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { daysAgo, daysAgoTextColor } from "@/utils/helper";
import { useRouter } from "expo-router";
import { MoreVerticalIcon, TagIcon } from "lucide-react-native";
import React, { useCallback } from "react";
import { Image, Text, View } from "react-native";

type PeopleFlowRowProps = {
	personFlow: PeopleFlow;
};

const PeopleFlowRowComponent = ({ personFlow }: PeopleFlowRowProps) => {
	const router = useRouter();

	const handlePress = useCallback(() => {
		router.push(`/people/profile/${personFlow.people_id}`);
	}, [personFlow.people_id, router]);

	return (
		<View className="flex-col items-center py-4 border-b border-border-secondary">
			<View className="flex-row w-full mb-2 pr-2 justify-between items-center">
				<View className="bg-blue-100 px-3 py-1.5 rounded-full flex-row items-center gap-1 self-start">
					<TagIcon size={12} color="#1D4ED8" />
					<Text className="text-blue-700 text-xs font-medium">
						{personFlow.step_key}
					</Text>
				</View>
				{/* Last Contacted */}

				<Text
					className={
						daysAgoTextColor(personFlow.last_contacted) +
						" text-sm font-semibold"
					}
				>
					{daysAgo(personFlow.last_contacted)}
				</Text>
			</View>
			<View className="flex-row items-center justify-center">
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
					<Text className="text-text dark:text-text-dark-primary font-semibold mb-1">
						{personFlow.p__full_name}
					</Text>
					<Text className="text-text-secondary text-sm">
						{personFlow.p__phone ?? "-"}
					</Text>
				</View>

				<MoreVerticalIcon size={20} color="#999" />
			</View>
		</View>
	);
};

const PeopleFlowRow = React.memo(PeopleFlowRowComponent);
export default PeopleFlowRow;
