import { Colors } from "@/constants/Colors";
import {
	ArrowDown,
	ArrowUp,
	CircleArrowDownIcon,
	CircleArrowUpIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const SortDropdown = ({
	sortAsc,
	setSortAsc,
}: {
	sortAsc: boolean;
	setSortAsc: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const [open, setOpen] = useState(false);

	return (
		<View className="relative mt-2">
			{/* Sort trigger */}
			<TouchableOpacity
				onPress={() => setOpen((prev) => !prev)}
				className="flex-row gap-1 items-center"
			>
				<Text className="text-sm text-gray-800">Upload date</Text>
				{sortAsc ? (
					<CircleArrowUpIcon
						fill="#99aaff"
						size={20}
						className="p-2"
						color={Colors.white}
					/>
				) : (
					<CircleArrowDownIcon
						fill="#99aaff"
						size={20}
						color={Colors.white}
					/>
				)}
			</TouchableOpacity>

			{/* Dropdown options */}
			{open && (
				<View className="absolute text-sm top-6 left-0 bg-white w-[10rem] rounded-md border border-gray-200 shadow-md z-10">
					<TouchableOpacity
						className="px-2 py-2 flex-row items-center gap-2 border-b border-gray-100"
						onPress={() => {
							setSortAsc(false); // New → Old
							setOpen(false);
						}}
					>
						<ArrowDown size={14} color="#007AFF" />
						<Text className="text-sm text-gray-800">New to Old</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className="px-2 py-2 flex-row items-center gap-2"
						onPress={() => {
							setSortAsc(true); // Old → New
							setOpen(false);
						}}
					>
						<ArrowUp size={14} color="#007AFF" />
						<Text className="text-sm text-gray-800">Old to New</Text>
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
};

export default SortDropdown;
