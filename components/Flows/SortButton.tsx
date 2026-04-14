import { FlowSortKey, FlowSortOrder } from "@/services/Flow/flow.types";
import {
	ArrowDownIcon,
	ArrowUpDownIcon,
	ArrowUpIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

const SORT_OPTIONS: { key: FlowSortKey; label: string }[] = [
	{ key: "last_contacted", label: "Last Contacted" },
	{ key: "last_assigned_at", label: "Last Assigned" },
];

type Props = {
	sortKey: FlowSortKey | null;
	sortOrder: FlowSortOrder;
	onChange: (key: FlowSortKey, order: FlowSortOrder) => void;
	onClear: () => void;
};

const SortButton = ({ sortKey, sortOrder, onChange, onClear }: Props) => {
	const [open, setOpen] = useState(false);

	const activeLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label;

	const handleSelect = (key: FlowSortKey) => {
		if (key === sortKey) {
			// Toggle direction if same field tapped
			onChange(key, sortOrder === "asc" ? "desc" : "asc");
		} else {
			// New field — default to desc (most recent first)
			onChange(key, "desc");
		}
		setOpen(false);
	};

	const ArrowIcon = sortOrder === "asc" ? ArrowUpIcon : ArrowDownIcon;

	return (
		<>
			{/* Trigger button */}
			<TouchableOpacity
				onPress={() => setOpen(true)}
				activeOpacity={0.7}
				className={`flex-row items-center gap-1 px-3 py-4 rounded-[15px] border ${
					sortKey
						? // ? "bg-blue-500 border-blue-500"
							"bg-white border-gray-200"
						: "bg-white border-gray-200"
				}`}
			>
				{sortKey ? (
					<>
						<ArrowIcon size={12} color="gray" strokeWidth={2.5} />
						<Text
							className="text-gray-600 text-xs font-semibold"
							numberOfLines={1}
						>
							{activeLabel}
						</Text>
					</>
				) : (
					<>
						<ArrowUpDownIcon
							size={14}
							color="#9ca3af"
							strokeWidth={2}
						/>
						<Text className="text-gray-400 text-xs font-medium">
							Sort
						</Text>
					</>
				)}
			</TouchableOpacity>

			{/* Bottom sheet modal */}
			<Modal
				visible={open}
				transparent
				animationType="slide"
				onRequestClose={() => setOpen(false)}
			>
				<Pressable
					className="flex-1 bg-black/30"
					onPress={() => setOpen(false)}
				/>
				<View className="bg-white rounded-t-3xl px-5 pt-4 pb-10">
					{/* Handle */}
					<View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

					<Text className="text-base font-bold text-gray-800 mb-4">
						Sort by
					</Text>

					{SORT_OPTIONS.map(({ key, label }) => {
						const isActive = sortKey === key;
						return (
							<TouchableOpacity
								key={key}
								onPress={() => handleSelect(key)}
								activeOpacity={0.7}
								className={`flex-row items-center justify-between px-4 py-3.5 rounded-2xl mb-2 ${
									isActive
										? "bg-blue-50 border border-blue-200"
										: "bg-gray-50"
								}`}
							>
								<Text
									className={`text-sm font-semibold ${
										isActive
											? "text-blue-600"
											: "text-gray-700"
									}`}
								>
									{label}
								</Text>

								{isActive && (
									<View className="flex-row items-center gap-1.5">
										<Text className="text-blue-500 text-xs font-medium">
											{sortOrder === "asc"
												? "Oldest first"
												: "Newest first"}
										</Text>
										{sortOrder === "asc" ? (
											<ArrowUpIcon
												size={14}
												color="#3b82f6"
												strokeWidth={2.5}
											/>
										) : (
											<ArrowDownIcon
												size={14}
												color="#3b82f6"
												strokeWidth={2.5}
											/>
										)}
									</View>
								)}
							</TouchableOpacity>
						);
					})}

					{/* Clear sort */}
					{sortKey && (
						<TouchableOpacity
							onPress={() => {
								onClear();
								setOpen(false);
							}}
							activeOpacity={0.7}
							className="mt-1 py-3 items-center"
						>
							<Text className="text-sm text-gray-400 font-medium">
								Clear sort
							</Text>
						</TouchableOpacity>
					)}
				</View>
			</Modal>
		</>
	);
};

export default SortButton;
