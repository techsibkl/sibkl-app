import React from "react";
import { View } from "react-native";
import { SkeletonRow } from "./SkeletonRow";

const SkeletonPeopleRow = () => {
	return (
		<View className="p-4 flex-row items-center rounded-lg mb-2">
			{/* Avatar */}
			<SkeletonRow width={48} height={48} borderRadius={24} />
			{/* Text */}
			<View className="flex-1 ml-4 space-y-2">
				<SkeletonRow width="70%" height={16} />
				<SkeletonRow width="50%" height={16} />
			</View>
		</View>
	);
};

export default SkeletonPeopleRow;
