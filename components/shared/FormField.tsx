import React from "react";
import { Controller } from "react-hook-form";
import { KeyboardTypeOptions, Text, TextInput, View } from "react-native";

type Props = {
	name: string;
	label: string;
	control: any;
	rules?: any;
	errors?: any;
	placeholder?: string;
	icon?: any;
	rightIcon?: any;
	initial?: string;
	disabled?: boolean;
	keyboardType?: KeyboardTypeOptions;
};

export const FormField = ({
	name,
	label,
	control,
	rules = {},
	errors = {},
	placeholder,
	icon,
	rightIcon,
	initial,
	disabled = false,
	keyboardType,
}: Props) => (
	<View className="mb-6">
		<Text className="text-sm font-medium text-text mb-2">{label}</Text>
		<View className="relative">
			{icon && <View className="absolute left-3 top-3 z-10">{icon}</View>}
			<Controller
				control={control}
				name={name}
				rules={rules}
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className={`pl-4 h-12 ${disabled ? `text-gray-400 ` : `text-text`} bg-white border border-border rounded-[15px] `}
						placeholder={placeholder}
						placeholderTextColor="#9ca3af"
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
						keyboardType={keyboardType}
						editable={!disabled}
					/>
				)}
			/>
			{rightIcon && (
				<View className="absolute right-3 top-3">{rightIcon}</View>
			)}
			{errors[name] && (
				<Text className="text-primary-500 text-sm mt-1">
					{errors[name]?.message}
				</Text>
			)}
		</View>
	</View>
);
