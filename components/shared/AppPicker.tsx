import { CheckIcon, ChevronDownIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

export type PickerOption<T> = {
	label: string;
	value: T;
};

type Props<T> = {
	value: T;
	options: PickerOption<T>[];
	onChange: (value: T) => void;
	disabled?: boolean;
	renderTrigger?: (label: string, isPlaceholder: boolean) => React.ReactNode;
	onAfterChange?: (value: T) => void;
	onClose?: (value: T) => void;
	showPlaceholder?: boolean;
};
export function AppPicker<T>({
	value,
	options,
	onChange,
	disabled = false,
	renderTrigger,
	onAfterChange,
	onClose,
	placeholder = "Select an option...",
	showPlaceholder = true,
}: Props<T> & { placeholder?: string }) {
	const [open, setOpen] = useState(false);
	const [localValue, setLocalValue] = useState<T | null>(value ?? null);

	const selectedLabel = options.find((o) => o.value === value)?.label ?? "";
	const isPlaceholder = value === null || value === undefined || value === "";

	const allOptions = showPlaceholder
		? [{ label: placeholder, value: null as unknown as T }, ...options]
		: options;

	const handleDone = () => {
		onChange(localValue as T);
		setOpen(false);
		onClose?.(localValue as T);
	};

	const handleSelectOption = (optionValue: T) => {
		setLocalValue(optionValue);
		onChange(optionValue);
		setOpen(false);
		onClose?.(optionValue);
	};

	return (
		<>
			<Pressable
				className="w-full justify-center py-2 h-full"
				disabled={disabled}
				onPress={() => {
					setLocalValue(value ?? null);
					setOpen(true);
				}}
			>
				{renderTrigger ? (
					renderTrigger(selectedLabel, isPlaceholder)
				) : (
					<View className="flex-row items-center justify-between px-3 py-2 rounded-lg border border-border bg-white">
						<Text
							className={`flex-1 text-base ${
								isPlaceholder
									? "text-text-secondary"
									: "text-text"
							}`}
						>
							{isPlaceholder ? placeholder : selectedLabel}
						</Text>
						<ChevronDownIcon size={20} color="#6b7280" />
					</View>
				)}
			</Pressable>

			<Modal visible={open} transparent animationType="fade">
				<Pressable
					className="flex-1 bg-black/40 justify-end"
					onPress={() => setOpen(false)}
				>
					<Pressable
						className="bg-white rounded-t-2xl"
						onPress={(e) => e.stopPropagation()}
					>
						{/* Header with Done button */}
						<View className="flex-row justify-between items-center px-4 py-3 border-b border-border">
							<Text className="text-lg font-semibold text-text">
								{placeholder}
							</Text>
							<Pressable onPress={handleDone}>
								<Text className="text-blue-600 font-semibold text-base">
									Done
								</Text>
							</Pressable>
						</View>

						{/* Scrollable options list */}
						<ScrollView
							className="max-h-80"
							showsVerticalScrollIndicator={true}
							contentContainerStyle={{ paddingBottom: 40 }}
							nestedScrollEnabled={true}
						>
							{allOptions.map((opt, i) => (
								<Pressable
									key={
										i === 0
											? "__placeholder__"
											: String(opt.value)
									}
									className={`flex-row items-center px-4 py-3 border-b border-border/50 ${
										localValue === opt.value
											? "bg-blue-50"
											: "bg-white"
									}`}
									onPress={() =>
										handleSelectOption(opt.value)
									}
								>
									<Text
										className={`flex-1 text-base ${
											localValue === opt.value
												? "text-blue-600 font-semibold"
												: i === 0
													? "text-text-secondary"
													: "text-text"
										}`}
									>
										{opt.label}
									</Text>
									{localValue === opt.value && (
										<CheckIcon size={20} color="#3b82f6" />
									)}
								</Pressable>
							))}
						</ScrollView>
					</Pressable>
				</Pressable>
			</Modal>
		</>
	);
}
