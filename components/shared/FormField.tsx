import { formStyles } from "@/constants/const_styles";
import React from "react";
import { Controller } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

export const FormField = ({
	name,
	label,
	control,
	rules,
	errors,
	placeholder,
	icon,
	rightIcon,
	readonly = false,
	onBlur: onBlurCallback,
	onChangeText: onChangeTextCallback,
	...rest
}: any) => (
	<View className="gap-y-2">
		<Text className="ml-1 text-sm font-medium text-text">{label}</Text>
		<View className="relative">
			{icon && <View className="absolute left-3 top-3 z-10">{icon}</View>}
			<Controller
				control={control}
				name={name}
				rules={rules}
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className={`${formStyles.inputText} ${readonly ? `text-gray-400` : `text-text`}`}
						placeholder={placeholder}
						placeholderTextColor="#9ca3af"
						submitBehavior="blurAndSubmit"
						readOnly={readonly}
						onBlur={() => {
							onBlur();
							onBlurCallback?.(value);
						}}
						onChangeText={(val) => {
							onChange(val);
							onChangeTextCallback?.(val);
						}}
						value={value}
						{...rest}
					/>
				)}
			/>
			{rightIcon && (
				<View className="absolute right-3 top-3">{rightIcon}</View>
			)}
		</View>
		{errors[name] && (
			<Text className="ml-1 text-red-600 text-sm">
				{errors[name]?.message}
			</Text>
		)}
	</View>
);
