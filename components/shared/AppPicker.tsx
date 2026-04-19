import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";

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
	onAfterChange?: (value: T) => void; // onChangeText — fires on select
	onClose?: (value: T) => void; // onBlur — fires on dismiss
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
}: Props<T> & { placeholder?: string }) {
	const [open, setOpen] = useState(false);
	const [localValue, setLocalValue] = useState<T | null>(value ?? null);

	const selectedLabel = options.find((o) => o.value === value)?.label ?? "";
	const isPlaceholder = value === null || value === undefined || value === "";

	const allOptions = [
		{ label: placeholder, value: null as unknown as T },
		...options,
	];

	if (Platform.OS === "android") {
		return (
			<Picker
				enabled={!disabled}
				selectedValue={value}
				onValueChange={(v) => {
					onChange(v);
					onClose?.(v);
				}}
			>
				{allOptions.map((opt, i) => (
					<Picker.Item
						key={i === 0 ? "__placeholder__" : String(opt.value)}
						label={opt.label}
						value={opt.value}
						color={i === 0 ? "#9ca3af" : "#111827"}
					/>
				))}
			</Picker>
		);
	}

	const handleDone = () => {
		onChange(localValue as T);
		setOpen(false);
		onClose?.(localValue as T);
	};

	return (
		<>
			<Pressable
				className="w-full py-4"
				disabled={disabled}
				onPress={() => {
					setLocalValue(value ?? null);
					setOpen(true);
				}}
			>
				{renderTrigger?.(selectedLabel, isPlaceholder)}
			</Pressable>

			<Modal visible={open} transparent animationType="slide">
				<Pressable className="flex-1 justify-end bg-black/30">
					<View className="bg-white rounded-t-2xl">
						<View className="flex-row justify-end p-4 border-b border-border">
							<Pressable onPress={handleDone}>
								<Text className="text-blue-600 font-semibold">
									Done
								</Text>
							</Pressable>
						</View>
						<Picker
							selectedValue={localValue}
							onValueChange={(v) => {
								setLocalValue(v as T);
							}}
						>
							{allOptions.map((opt, i) => (
								<Picker.Item
									key={
										i === 0
											? "__placeholder__"
											: String(opt.value)
									}
									label={opt.label}
									value={opt.value}
									color={i === 0 ? "#9ca3af" : "#111827"}
								/>
							))}
						</Picker>
					</View>
				</Pressable>
			</Modal>
		</>
	);
}
