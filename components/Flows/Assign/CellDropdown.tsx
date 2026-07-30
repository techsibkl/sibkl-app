import { Cell } from "@/services/Cell/cell.types";
import { ChevronDownIcon, CircleIcon } from "lucide-react-native";
import React from "react";
import {
	ActivityIndicator,
	FlatList,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type CellDropdownProps = {
	cells: Cell[];
	selected: Cell | null;
	onSelect: (cell: Cell) => void;
	onClear: () => void;
	isOpen: boolean;
	onToggle: () => void;
	isLoading: boolean;
};

const CellDropdown = ({
	cells,
	selected,
	onSelect,
	onClear,
	isOpen,
	onToggle,
	isLoading,
}: CellDropdownProps) => (
	<View className="mb-5">
		<Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
			Cell
		</Text>

		{/* Trigger */}
		<TouchableOpacity
			onPress={onToggle}
			className="border border-gray-300 rounded-xl px-4 py-3.5 flex-row items-center justify-between bg-white"
			activeOpacity={0.7}
		>
			<View className="flex-row items-center gap-2 flex-1">
				<CircleIcon size={14} color={selected ? "#16a34a" : "#d1d5db"} />
				<Text
					className={`text-sm flex-1 ${
						selected ? "text-text font-semibold" : "text-gray-400"
					}`}
					numberOfLines={1}
				>
					{selected?.cell_name ?? "Select cell..."}
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
						data={cells}
						keyExtractor={(item) => String(item.id)}
						renderItem={({ item }) => (
							<TouchableOpacity
								onPress={() => onSelect(item)}
								className={`px-4 py-3 border-b border-gray-100 flex-row items-center gap-3 ${
									selected?.id === item.id ? "bg-green-50" : ""
								}`}
							>
								<CircleIcon size={13} color="#16a34a" />
								<View className="flex-1">
									<Text className="text-sm text-text">{item.cell_name}</Text>
									{item.district_name && (
										<Text className="text-xs text-gray-400 mt-0.5">
											{item.district_name}
										</Text>
									)}
								</View>
								{selected?.id === item.id && (
									<Text className="text-green-600 font-bold text-sm">✓</Text>
								)}
							</TouchableOpacity>
						)}
						ListEmptyComponent={
							<View className="py-5 items-center">
								<Text className="text-xs text-gray-400">No cells found</Text>
							</View>
						}
					/>
				)}
			</View>
		)}
	</View>
);

export default CellDropdown;
