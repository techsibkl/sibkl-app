import { District } from "@/services/District/district.types";
import { ChevronDownIcon, MapPinIcon } from "lucide-react-native";
import React from "react";
import {
	ActivityIndicator,
	FlatList,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type DistrictDropdownProps = {
	districts: District[];
	selected: District | null;
	onSelect: (district: District) => void;
	onClear: () => void;
	isOpen: boolean;
	onToggle: () => void;
	isLoading: boolean;
};

const DistrictDropdown = ({
	districts,
	selected,
	onSelect,
	onClear,
	isOpen,
	onToggle,
	isLoading,
}: DistrictDropdownProps) => (
	<View className="mb-5">
		<Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
			District
		</Text>

		{/* Trigger */}
		<TouchableOpacity
			onPress={onToggle}
			className="border border-gray-300 rounded-xl px-4 py-3.5 flex-row items-center justify-between bg-white"
			activeOpacity={0.7}
		>
			<View className="flex-row items-center gap-2 flex-1">
				<MapPinIcon size={14} color={selected ? "#7c3aed" : "#d1d5db"} />
				<Text
					className={`text-sm flex-1 ${
						selected ? "text-text font-semibold" : "text-gray-400"
					}`}
					numberOfLines={1}
				>
					{selected?.name ?? "Select district..."}
				</Text>
			</View>
			<View className="flex-row items-center gap-2">
				{selected && (
					<TouchableOpacity
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
						onPress={(e) => {
							e.stopPropagation();
							onClear();
						}}
					>
						<Text className="text-gray-400 text-xl leading-none">×</Text>
					</TouchableOpacity>
				)}
				<ChevronDownIcon
					size={16}
					color="#9ca3af"
					style={{
						transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
					}}
				/>
			</View>
		</TouchableOpacity>

		{/* Expandable list */}
		{isOpen && (
			<View
				className="border border-gray-200 rounded-xl mt-2 bg-white overflow-hidden"
				style={{ maxHeight: 260 }}
			>
				{isLoading ? (
					<View className="py-5 items-center">
						<ActivityIndicator />
					</View>
				) : (
					<FlatList
						scrollEnabled
						nestedScrollEnabled
						data={districts}
						keyExtractor={(item) => String(item.id)}
						renderItem={({ item }) => (
							<TouchableOpacity
								onPress={() => onSelect(item)}
								className={`px-4 py-3 border-b border-gray-100 flex-row items-center gap-3 ${
									selected?.id === item.id ? "bg-purple-50" : ""
								}`}
							>
								<MapPinIcon size={13} color="#7c3aed" />
								<Text className="text-sm text-text flex-1">{item.name}</Text>
								{selected?.id === item.id && (
									<Text className="text-purple-600 font-bold text-sm">✓</Text>
								)}
							</TouchableOpacity>
						)}
						ListEmptyComponent={
							<View className="py-5 items-center">
								<Text className="text-xs text-gray-400">No districts available</Text>
							</View>
						}
					/>
				)}
			</View>
		)}
	</View>
);

export default DistrictDropdown;
