import React from "react";
import { View } from "react-native";
import SkeletonPeopleRow from "./SkeletonPeopleRow";

const SkeletonList = ({ length }: { length: number }) => {
	return (
		<View className="w-full flex-1 flex flex-col gap-4">
			{Array.from({ length }).map((_, index) => (
				<View key={index} className="border-b border-border">
					<SkeletonPeopleRow />
				</View>
			))}
		</View>
	);
};

export default SkeletonList;
