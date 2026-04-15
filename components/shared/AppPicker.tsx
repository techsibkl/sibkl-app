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

	/** iOS trigger */
	renderTrigger?: (label: string) => React.ReactNode;
};

export function AppPicker<T>({
	value,
	options,
	onChange,
	disabled = false,
	renderTrigger,
}: Props<T>) {
	const [open, setOpen] = useState(false);

	const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

	// ✅ ANDROID — inline picker
	if (Platform.OS === "android") {
		return (
			<Picker
				enabled={!disabled}
				selectedValue={value}
				onValueChange={onChange}
			>
				{options.map((opt) => (
					<Picker.Item
						key={String(opt.value)}
						label={opt.label}
						value={opt.value}
					/>
				))}
			</Picker>
		);
	}

	// ✅ IOS — modal picker
	return (
		<>
			<Pressable
				className="w-full py-4"
				disabled={disabled}
				onPress={() => setOpen(true)}
			>
				{renderTrigger?.(selectedLabel)}
			</Pressable>

			<Modal visible={open} transparent animationType="slide">
				<Pressable className="flex-1 justify-end bg-black/30">
					<View className="bg-white rounded-t-2xl">
						<View className="flex-row justify-end p-4 border-b border-border">
							<Pressable onPress={() => setOpen(false)}>
								<Text className="text-blue-600 font-semibold">
									Done
								</Text>
							</Pressable>
						</View>
						<Picker
							selectedValue={value}
							onValueChange={(v) => {
								onChange(v);
							}}
						>
							{options.map((opt) => (
								<Picker.Item
									key={String(opt.value)}
									label={opt.label}
									value={opt.value}
								/>
							))}
						</Picker>
					</View>
				</Pressable>
			</Modal>
		</>
	);
}
