import React, { ReactElement } from "react";
import { Controller } from "react-hook-form";
import {
	KeyboardTypeOptions,
	NativeSyntheticEvent,
	Text,
	TextInput,
	TextInputSubmitEditingEventData,
	View,
} from "react-native";

type Props = {
	name: string;
	label: string;
	control: any;
	rules?: any;
	errors?: any;
	placeholder?: string;
	icon?: ReactElement;
	rightIcon?: any;
	initial?: string;
	disabled?: boolean;
	keyboardType?: KeyboardTypeOptions;
	onBlur?: Function;
	onChangeText?: Function;
	onSubmitEditing?:
		| ((e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void)
		| undefined;
	secureTextEntry?: boolean;
	ref?: React.RefObject<TextInput | null>;
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
	onSubmitEditing: onSubmitEditingCallBack,
	secureTextEntry = false,
	ref,
}: Props) => (
	<View>
		<Text className="text-sm font-medium text-text mb-2">{label}</Text>
		<View>
			<Controller
				control={control}
				name={name}
				rules={rules}
				render={({ field: { onChange, onBlur, value } }) => (
					<View className="flex-row items-center bg-white border border-border rounded-[15px] px-4">
						{icon && <View className="mr-3">{icon}</View>}
						<TextInput
							ref={ref}
							className={`font-regular flex-1 py-4 ${disabled ? `text-gray-400` : `text-text`}`}
							placeholder={placeholder}
							placeholderTextColor="#9ca3af"
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							readOnly={disabled}
							keyboardType={keyboardType}
							secureTextEntry={secureTextEntry}
							onSubmitEditing={onSubmitEditingCallBack}
						/>
						{rightIcon && <View>{rightIcon}</View>}
					</View>
				)}
			/>
			{errors[name] && (
				<Text className="text-primary-500 text-sm mt-1">
					{errors[name]?.message}
				</Text>
			)}
		</View>
	</View>
);
