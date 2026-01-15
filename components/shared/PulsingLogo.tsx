import React, { useEffect, useRef } from "react";
import { Animated, ImageSourcePropType } from "react-native";

interface PulsingLogoProps {
	source: ImageSourcePropType;
	className?: string;
}

export default function PulsingLogo({ source, className }: PulsingLogoProps) {
	const scale = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		Animated.sequence([
			Animated.timing(scale, {
				toValue: 1.3, // scale up
				duration: 200,
				useNativeDriver: true,
			}),
			Animated.timing(scale, {
				toValue: 1, // scale back down
				duration: 800,
				useNativeDriver: true,
			}),
		]).start();
	}, [scale]);

	return (
		<Animated.Image
			source={source}
			className={className} // keep Tailwind classes
			style={{ transform: [{ scale }] }}
			resizeMode="contain"
		/>
	);
}
