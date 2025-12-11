import { formStyles } from "@/constants/const_styles";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Platform, Text, TouchableOpacity, View } from "react-native";

export const FormDateInput = ({
	name,
	label,
	control,
	placeholder,
	rules = {},
	errors = {},
	disabled = false,
	onBlur: onBlurCallback,
	onChangeText: onChangeTextCallback,
}: {
	name: string;
	label: string;
	control: any;
	placeholder?: string;
	rules?: any;
	errors?: any;
	disabled?: boolean;
	onBlur?: Function;
	onChangeText?: Function;
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
							disabled={disabled}
							className={`${formStyles.inputDate} ${
								disabled ? "opacity-50" : ""
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
								value={value ? new Date(value) : new Date()}
								mode="date"
								dateFormat="day month year"
								display={
									Platform.OS === "ios"
										? "spinner"
										: "default"
								}
								onChange={(event, selectedDate) => {
									setShow(Platform.OS === "ios"); // Keep open on iOS
									if (selectedDate) {
										onChange(selectedDate.toISOString());
										onChangeTextCallback?.(
											selectedDate.toISOString()
										);
									}
									if (Platform.OS === "android") {
										setShow(false);
									}
								}}
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
