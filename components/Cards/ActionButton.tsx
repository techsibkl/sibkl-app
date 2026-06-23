import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface ActionButtonProps {
	label: string;
	onPress: () => void;
	variant?: "primary" | "secondary" | "outline" | "ghost";
	isLoading?: boolean;
	size?: "sm" | "md";
}

const variantStyles = {
	primary: "bg-blue-500",
	secondary: "bg-gray-200",
	outline: "bg-transparent border border-gray-300",
	ghost: "bg-blue-100/30 rounded-full",
};

const textColorMap = {
	primary: "text-white",
	secondary: "text-gray-700",
	outline: "text-gray-700",
	ghost: "text-blue-600",
};

const sizeStyles = {
	sm: "px-4 py-2",
	md: "px-6 py-3",
};

/**
 * ActionButton: Reusable button for card actions
 * @example
 * <ActionButton label="Join CG +" onPress={handleJoin} variant="outline" />
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
	label,
	onPress,
	variant = "outline",
	isLoading = false,
	size = "md",
}) => (
	<TouchableOpacity
		onPress={onPress}
		disabled={isLoading}
		className={`${variant === "ghost" ? "rounded-full" : "rounded-lg"} items-center justify-center ${variantStyles[variant]} ${sizeStyles[size]}`}
	>
		{isLoading ? (
			<ActivityIndicator color={variant === "primary" ? "white" : "gray"} />
		) : (
			<Text
				className={`font-semibold text-sm ${
					textColorMap[variant]
				}`}
			>
				{label}
			</Text>
		)}
	</TouchableOpacity>
);
