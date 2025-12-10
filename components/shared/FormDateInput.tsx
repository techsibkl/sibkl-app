import { displayDateAsStr } from "@/utils/helper";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Platform, Text, TouchableOpacity, View } from "react-native";

export const FormDateInput = ({
	name,
	label,
	control,
	rules = {},
	errors = {},
	disabled = false,
}: {
	name: string;
	label: string;
	control: any;
	rules?: any;
	errors?: any;
	disabled?: boolean;
}) => {
	const [show, setShow] = useState(false);

	return (
		<View className="mb-6">
			<Text className="text-sm font-medium text-gray-700 mb-2">
				{label}
			</Text>

			<Controller
				control={control}
				name={name}
				rules={rules}
				render={({ field: { onChange, value } }) => (
					<>
						<TouchableOpacity
							disabled={disabled}
							className={`border border-gray-200 rounded-[15px] p-3 bg-gray-50 ${
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
									? displayDateAsStr(value)
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
