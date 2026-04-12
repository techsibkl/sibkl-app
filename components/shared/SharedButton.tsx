import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

type SharedButtonProps = {
	onPress: () => void;
	title: string;
	isLoading?: boolean;
	variant?: "primary" | "secondary" | "outline";
	disabled?: boolean;
	className?: string;
};

const SharedButton = ({
	onPress,
	title,
	isLoading = false,
	variant = "primary",
	disabled = false,
	className = "",
}: SharedButtonProps) => {
	const getVariantStyles = () => {
		if (disabled || isLoading) {
			switch (variant) {
				case "primary":
					return "bg-blue-300";
				case "secondary":
					return "bg-gray-300";
				case "outline":
					return "border border-gray-300 bg-transparent";
				default:
					return "bg-blue-300";
			}
		}

		switch (variant) {
			case "primary":
				return "bg-blue-500";
			case "secondary":
				return "bg-gray-500";
			case "outline":
				return "border border-blue-500 bg-transparent";
			default:
				return "bg-blue-500";
		}
	};

	const getTextStyles = () => {
		if (variant === "outline") {
			return disabled || isLoading ? "text-gray-400" : "text-blue-500";
		}
		return "text-white";
	};

	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled || isLoading}
			className={`px-4 py-2 rounded-lg ${getVariantStyles()} ${className}`}
			activeOpacity={0.7}
		>
			{isLoading ? (
				<ActivityIndicator
					size="small"
					color={variant === "outline" ? "#3B82F6" : "#fff"}
				/>
			) : (
				<Text className={`font-medium ${getTextStyles()}`}>
					{title}
				</Text>
			)}
		</TouchableOpacity>
	);
};

export default SharedButton;
