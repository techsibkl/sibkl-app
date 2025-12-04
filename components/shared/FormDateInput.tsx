import { formStyles } from "@/constants/const_styles";
import { DateTimePicker } from "@expo/ui/jetpack-compose";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";

export const FormDateInput = ({
	name,
	label,
	control,
	placeholder,
	rules,
	errors,
	readonly = false,
	onBlur: onBlurCallback,
	onChangeText: onChangeTextCallback,
}: {
	name: string;
	label: string;
	control: any;
	placeholder?: string;
	rules?: any;
	errors: any;
	readonly?: boolean;
	onBlur: Function;
	onChangeText: Function;
}) => {
	const [show, setShow] = useState(false);

	return (
		<View>
			<Text className="text-sm font-medium text-gray-700 mb-2">
				{label}
			</Text>

			<Controller
				control={control}
				name={name}
				rules={rules}
				render={({ field: { onChange, value } }) => (
					<>
						{/* Input-like touch area */}
						<TouchableOpacity
							disabled={readonly}
							className={`${formStyles.inputDate} ${
								readonly ? "opacity-50" : ""
							}`}
							onPress={() => setShow(true)}
						>
							<Text
								className={
									value ? "text-gray-900" : "text-gray-400"
								}
							>
								{value
									? new Date(value).toLocaleDateString()
									: "Select a date"}
							</Text>
						</TouchableOpacity>

						{show && (
							<DateTimePicker
								onDateSelected={(date) => {
									onChange(date); // update react-hook-form value
									onChangeTextCallback?.(date);
									setShow(false); // close after picking
								}}
								displayedComponents="date"
								variant="picker"
							/>
						)}
					</>
				)}
			/>

			{errors[name] && (
				<Text className="text-red-500 text-sm mt-1">
					{errors[name]?.message}
				</Text>
			)}
		</View>
	);
};
