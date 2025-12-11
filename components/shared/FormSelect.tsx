import { formStyles } from "@/constants/const_styles";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Controller } from "react-hook-form";
import { Text, View } from "react-native";

export const FormSelect = ({
	name,
	label,
	control,
	errors = {},
	placeholder = "Select an option...",
	rules = {},
	options = [],
	disabled = false,
	onBlur: onBlurCallback,
	onChangeText: onChangeTextCallback,
}: {
	name: string;
	label: string;
	control: any;
	errors?: any;
	placeholder?: string;
	rules?: any;
	options?: (string | number | null)[];
	disabled?: boolean;
	onBlur?: Function;
	onChangeText?: Function;
}) => {
	return (
		<View>
			<Text className="text-sm font-medium text-text mb-2">{label}</Text>
			<Controller
				control={control}
				name={name}
				rules={rules}
				render={({ field: { onChange, value } }) => (
					<View
						className={`${formStyles.inputSelect} ${disabled ? "bg-gray-100" : ""}`}
					>
						<Picker
							enabled={!disabled}
							selectedValue={value}
							onValueChange={(val) => {
								onChange(val);
								onChangeTextCallback?.(val);
							}}
						>
							{options.map((option, index) => (
								<Picker.Item
									style={{
										fontSize: 14,
									}}
									key={index}
									label={String(option)}
									value={option}
								/>
							))}
						</Picker>
					</View>
				)}
			/>
			{errors[name] && (
				<Text className="text-primary-500 text-sm mt-1">
					{errors[name]?.message}
				</Text>
			)}
		</View>
	);
};
