import React from "react";
import { ScrollView, Text, View } from "react-native";

type HelpDialogProps = {
	title: string;
	description: string;
};

const HelpDialog = ({ title, description }: HelpDialogProps) => {
	return (
		<ScrollView className="p-6">
			<Text className="text-lg font-bold text-text mb-4">{title}</Text>
			<Text className="text-sm text-text-secondary leading-6">
				{description}
			</Text>
		</ScrollView>
	);
};

export default HelpDialog;
