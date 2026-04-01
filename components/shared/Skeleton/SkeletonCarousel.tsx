import React from "react";
import { View } from "react-native";
import { SkeletonRow } from "./SkeletonRow";

const SkeletonCarousel = () => {
	return (
		<View className="w-full flex flex-row gap-4">
			<View className="w-96 aspect-video">
				<SkeletonRow width="100%" height="100%" borderRadius={15} />
			</View>
			<View className="w-96 aspect-video">
				<SkeletonRow width="100%" height="100%" borderRadius={15} />
			</View>
		</View>
	);
};

export default SkeletonCarousel;
