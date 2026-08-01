import { HelpCircle } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, View } from "react-native";

type HelpDialogProps = {
	title: string;
	description: string;
};

const HelpDialog = ({ title, description }: HelpDialogProps) => {
	return (
		<ScrollView className="p-6">
			<View className="flex-row items-center gap-2 mb-2">
				<HelpCircle size={18} color="#9ca3af" />
				<Text className="text-lg font-bold">{title}</Text>
			</View>
			<Text className="text-sm text-text-secondary leading-6">
				{description}
			</Text>
		</ScrollView>
	);
};

export default HelpDialog;
