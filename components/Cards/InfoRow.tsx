import React from "react";
import { Text, View } from "react-native";
import { InfoRowProps } from "./types";

/**
 * InfoRow: Icon + compact value
 * @example
 * <InfoRow icon={<Clock />} value="Saturday, 7:30 p.m" />
 */
export const InfoRow: React.FC<InfoRowProps> = ({ icon, value }) => {
	const displayValue = value.length > 25 ? value.substring(0, 25) + '...' : value;
	
	return (
		<View className="flex-row items-center gap-1.5">
			<View className="w-4 h-4 items-center justify-center">{icon}</View>
			<Text 
				numberOfLines={1}
				ellipsizeMode="tail"
				className="text-xs text-gray-600"
			>
				{displayValue}
			</Text>
		</View>
	);
};
