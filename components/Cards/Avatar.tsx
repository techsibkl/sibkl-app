import { useThemeColors } from "@/hooks/useThemeColor";
import React from "react";
import { Image, Text, View } from "react-native";

interface AvatarProps {
	initials?: string;
	imageUrl?: string;
	size?: "sm" | "md" | "lg";
}

const sizeMap = {
	sm: "w-8 h-8",
	md: "w-12 h-12",
	lg: "w-16 h-16",
};

const textSizeMap = {
	sm: "text-xs",
	md: "text-base",
	lg: "text-2xl",
};

/**
 * Avatar: Reusable avatar component with initials fallback
 * @example
 * <Avatar initials="RG" size="md" />
 * <Avatar imageUrl="https://..." size="md" />
 */
export const Avatar: React.FC<AvatarProps> = ({
	initials,
	imageUrl,
	size = "md",
}) => {
	const { isDark } = useThemeColors();

	return (
		<View
			className={`${sizeMap[size]} rounded-full items-center justify-center border ${
				isDark 
					? "bg-slate-700 border-slate-600" 
					: "bg-gray-200 border-gray-300"
			}`}
		>
			{imageUrl ? (
				<Image
					source={{ uri: imageUrl }}
					className={`${sizeMap[size]} rounded-full`}
				/>
			) : (
				<Text
					className={`${textSizeMap[size]} font-bold ${
						isDark ? "text-white" : "text-gray-700"
					}`}
				>
					{initials}
				</Text>
			)}
		</View>
	);
};
