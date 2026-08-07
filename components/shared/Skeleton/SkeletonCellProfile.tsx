import React from "react";
import { View } from "react-native";
import { SkeletonRow } from "./SkeletonRow";
import SkeletonPeopleRow from "./SkeletonPeopleRow";

const SkeletonCellProfile = () => {
	return (
		<View className="flex-1 px-4">
			{/* Cell Header Section */}
			<View className="items-center py-6">
				<SkeletonRow width={96} height={96} borderRadius={48} />
				<View className="mt-4 w-full">
					<SkeletonRow width="60%" height={28} />
					<View className="mt-2">
						<SkeletonRow width="40%" height={16} />
					</View>
				</View>
			</View>

			{/* Action Buttons */}
			<View className="flex-row justify-center gap-2 w-full mb-6">
				{[1, 2, 3].map((i) => (
					<View key={i} className="flex-1 min-w-[20%]">
						<SkeletonRow width="100%" height={80} />
					</View>
				))}
			</View>

			{/* Tab Bar */}
			<View className="flex-row gap-2 mb-4">
				{[1, 2, 3].map((i) => (
					<View key={i} className="flex-1">
						<SkeletonRow width="100%" height={40} />
					</View>
				))}
			</View>

			{/* Tab Content - People List */}
			<View className="px-2">
				{Array.from({ length: 5 }).map((_, i) => (
					<View key={i} className="border-b border-border">
						<SkeletonPeopleRow />
					</View>
				))}
			</View>
		</View>
	);
};

export default SkeletonCellProfile;
