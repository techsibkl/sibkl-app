import { formStyles } from "@/constants/const_styles";
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
	onBlur?: Function;
	onChangeText?: Function;
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
	onBlur: onBlurCallback,
	onChangeText: onChangeTextCallback,
}: any) => (
	<View>
		<Text className="text-sm font-medium text-text mb-2">{label}</Text>
		<View className="relative">
			{icon && <View className="absolute left-3 top-3 z-10">{icon}</View>}
			<Controller
				control={control}
				name={name}
				rules={rules}
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className={`${formStyles.inputText} ${disabled ? `text-gray-400` : `text-text`}`}
						placeholder={placeholder}
						placeholderTextColor="#9ca3af"
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
						readOnly={disabled}
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
