import { formStyles } from "@/constants/const_styles";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Text, View } from "react-native";
import { AppPicker } from "./AppPicker";

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
	const [open, setOpen] = useState(false);

	return (
		<View>
			<Text className="text-sm font-medium text-text mb-2">{label}</Text>
			<Controller
				control={control}
				name={name}
				rules={rules}
				render={({ field: { onChange, value } }) => {
					return (
						<View
							className={`${formStyles.inputSelect} ${disabled ? "bg-gray-100" : ""}`}
						>
							<AppPicker
								value={value}
								onChange={onChange}
								options={[
									...options.map((o) => ({
										label: String(o),
										value: o,
									})),
								]}
								renderTrigger={(label) => (
									<Text className="font-regular text-sm">
										{label || "Select flow"}
									</Text>
								)}
							/>
						</View>
					);
				}}
			/>
			{errors[name] && (
				<Text className="text-primary-500 text-sm mt-1">
					{errors[name]?.message}
				</Text>
			)}
		</View>
	);
};
