import { ChevronRightIcon } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SectionHeaderProps {
	title: string;
	onPress?: () => void;
	showSeeAll?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
	title,
	onPress,
	showSeeAll = true,
}) => {
	return (
		<View className="flex-row items-center justify-between px-4 mb-3">
			<Text className="text-xl font-bold">{title}</Text>
			{showSeeAll && onPress && (
				<TouchableOpacity
					className="flex-row items-center"
					onPress={onPress}
					activeOpacity={0.7}
				>
					<Text className="text-sm mr-1">See All</Text>
					<ChevronRightIcon size={16} />
				</TouchableOpacity>
			)}
		</View>
	);
};

export default SectionHeader;
