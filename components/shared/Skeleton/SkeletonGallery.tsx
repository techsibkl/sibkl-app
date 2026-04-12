import React from "react";
import { Dimensions, View } from "react-native";
import { SkeletonRow } from "./SkeletonRow";

interface SkeletonGalleryProps {
	columns?: number;
	count?: number;
	gap?: number;
}

const SkeletonGallery: React.FC<SkeletonGalleryProps> = ({
	columns = 2,
	count = 6,
	gap = 16,
}) => {
	const screenWidth = Dimensions.get("window").width;
	const itemWidth = (screenWidth - gap * (columns + 1)) / columns;

	return (
		<View
			style={{
				flexDirection: "row",
				flexWrap: "wrap",
				paddingHorizontal: 16,
				gap,
			}}
		>
			{Array.from({ length: count }).map((_, i) => (
				<View
					key={i}
					style={{
						width: itemWidth,
						marginBottom: gap,
					}}
				>
					<SkeletonRow width="100%" height={100} borderRadius={8} />
					<View style={{ marginTop: 8 }}>
						<SkeletonRow width="70%" height={12} />
						<SkeletonRow width="50%" height={12} />
					</View>
				</View>
			))}
		</View>
	);
};

export default SkeletonGallery;
