import { formStyles } from "@/constants/const_styles";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
	Modal,
	Platform,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";

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
	const [tempDate, setTempDate] = useState<Date | null>(null);

	return (
		<View>
			<Text className="text-sm font-medium text-gray-700 pl-1 mb-2">
				{label}
			</Text>

			<Controller
				control={control}
				name={name}
				rules={rules}
				render={({ field: { onChange, value } }) => (
					<>
						{/* Trigger */}
						<TouchableOpacity
							disabled={disabled}
							className={`${formStyles.inputDate} ${disabled ? "opacity-50" : ""}`}
							onPress={() => {
								setTempDate(
									value ? new Date(value) : new Date(),
								);
								setShow(true);
							}}
						>
							<Text
								className={
									value ? "text-gray-900" : "text-gray-400"
								}
							>
								{value
									? new Date(value).toLocaleDateString()
									: (placeholder ?? "Select a date")}
							</Text>
						</TouchableOpacity>

						{/* Android — native modal picker, no bottom sheet needed */}
						{Platform.OS === "android" && show && (
							<DateTimePicker
								value={value ? new Date(value) : new Date()}
								mode="date"
								display="default"
								onChange={(event, selectedDate) => {
									setShow(false);
									if (event.type === "set" && selectedDate) {
										onChange(selectedDate.toISOString());
										onChangeTextCallback?.(
											selectedDate.toISOString(),
										);
									}
								}}
							/>
						)}

						{/* iOS — bottom sheet modal with spinner */}
						{Platform.OS === "ios" && (
							<Modal
								visible={show}
								transparent
								animationType="slide"
								onRequestClose={() => setShow(false)}
							>
								<TouchableWithoutFeedback
									onPress={() => setShow(false)}
								>
									<View className="flex-1 bg-black/40 justify-end">
										<TouchableWithoutFeedback>
											<View className="bg-white rounded-t-3xl pb-8">
												{/* Handle bar */}
												<View className="items-center pt-3 pb-2">
													<View className="w-10 h-1 rounded-full bg-gray-300" />
												</View>

												{/* Header */}
												<View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100">
													<TouchableOpacity
														onPress={() =>
															setShow(false)
														}
													>
														<Text className="text-base text-gray-500 font-medium">
															Cancel
														</Text>
													</TouchableOpacity>
													<Text className="text-base font-semibold text-gray-800">
														{label}
													</Text>
													<TouchableOpacity
														onPress={() => {
															const selected =
																tempDate ??
																new Date();
															onChange(
																selected.toISOString(),
															);
															onChangeTextCallback?.(
																selected.toISOString(),
															);
															setShow(false);
														}}
													>
														<Text className="text-base text-blue-500 font-semibold">
															Done
														</Text>
													</TouchableOpacity>
												</View>

												{/* Spinner */}
												<DateTimePicker
													value={
														tempDate ??
														(value
															? new Date(value)
															: new Date())
													}
													mode="date"
													display="spinner"
													textColor="#000000"
													onChange={(
														_,
														selectedDate,
													) => {
														if (selectedDate)
															setTempDate(
																selectedDate,
															);
													}}
													style={{ height: 200 }}
												/>
											</View>
										</TouchableWithoutFeedback>
									</View>
								</TouchableWithoutFeedback>
							</Modal>
						)}
					</>
				)}
			/>

			{errors[name] && (
				<Text className="text-red-500 text-sm pl-1 mt-1">
					{errors[name]?.message}
				</Text>
			)}
		</View>
	);
};
