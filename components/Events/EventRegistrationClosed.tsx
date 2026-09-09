import React from "react";
import { Text, View } from "react-native";

type EventRegistrationClosedProps = {
	message: string;
};

const EventRegistrationClosed = ({ message }: EventRegistrationClosedProps) => (
	<View className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
		<Text className="text-base font-semibold text-amber-900 mb-1">
			Registration closed
		</Text>
		<Text className="text-sm text-amber-800">{message}</Text>
	</View>
);

export default EventRegistrationClosed;
