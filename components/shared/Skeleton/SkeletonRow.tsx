import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface SkeletonRowProps {
	width?: number | string;
	height?: number;
	borderRadius?: number;
}

export const SkeletonRow: React.FC<SkeletonRowProps> = ({
	width = "100%",
	height = 16,
	borderRadius = 4,
}) => {
	const shimmerAnim = useRef(new Animated.Value(-1)).current;

	useEffect(() => {
		Animated.loop(
			Animated.timing(shimmerAnim, {
				toValue: 1,
				duration: 1000,
				useNativeDriver: true,
			})
		).start();
	}, []);

	const translateX = shimmerAnim.interpolate({
		inputRange: [-1, 1],
		outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
	});

	return (
		<View
			style={[
				styles.container,
				{ width, height, borderRadius } as ViewStyle,
			]}
		>
			<Animated.View
				style={[
					styles.shimmer,
					{
						transform: [{ translateX }],
					},
				]}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#e2e8f0", // base gray
		overflow: "hidden",
		marginBottom: 8,
	},
	shimmer: {
		flex: 1,
		width: "50%",
		backgroundColor: "#f1f5f9", // lighter shimmer
		opacity: 0.7,
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
	},
});
