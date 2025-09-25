import { Search } from "lucide-react-native";
import React from "react";
import { TextInput, View } from "react-native";

interface SharedSearchBarProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	placeholder?: string;
	className?: string;
	iconColor?: string;
	placeholderTextColor?: string;
}

export const SharedSearchBar: React.FC<SharedSearchBarProps> = ({
	searchQuery,
	onSearchChange,
	placeholder = "Search keyword",
	className = "flex-row items-center rounded-[15px] mx-4 px-4 py-3  bg-gray-200 border border-border overflow-hidden",
	iconColor = "#777",
	placeholderTextColor = "#777",
}) => {
	return (
		<View className="pb-4 border-b border-border">
			<View className={className}>
				<Search size={20} color={iconColor} />
				<TextInput
					className="w-full ml-2"
					numberOfLines={1}
					placeholder={placeholder}
					placeholderTextColor={placeholderTextColor}
					value={searchQuery}
					onChangeText={onSearchChange}
				/>
			</View>
		</View>
	);
};
