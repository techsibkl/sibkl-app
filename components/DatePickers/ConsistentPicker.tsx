import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CalendarPicker from "react-native-calendar-picker";

type ConsistentPickerProps = {
	date: Date | null;
	onConfirm: (selectedDate: Date) => void;
	onCancel: () => void;
	open: boolean;
};

export default function ConsistentPicker({
	date,
	onConfirm,
	onCancel,
	open,
}: ConsistentPickerProps) {
	const [tempDate, setTempDate] = useState<Date | null>(null);

	const currentDate = date || new Date();

	// Android — native modal picker
	if (Platform.OS === "android" && open) {
		return (
			<DateTimePicker
				value={currentDate}
				mode="date"
				display="default"
				onChange={(event, selectedDate) => {
					if (event.type === "set" && selectedDate) {
						onConfirm(selectedDate);
					} else {
						onCancel();
					}
				}}
			/>
		);
	}

	// iOS — calendar picker in a modal (avoids scroll issues with spinners)
	return (
		<Modal
			visible={open && Platform.OS === "ios"}
			transparent
			animationType="slide"
			onRequestClose={onCancel}
		>
			<TouchableWithoutFeedback onPress={onCancel}>
				<View className="flex-1 bg-black/40 justify-end">
					<TouchableWithoutFeedback>
						<View className="bg-white rounded-t-3xl pb-8">
							{/* Handle bar */}
							<View className="items-center pt-3 pb-2">
								<View className="w-10 h-1 rounded-full bg-gray-300" />
							</View>

							{/* Header */}
							<View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100">
								<TouchableOpacity onPress={onCancel}>
									<Text className="text-base text-gray-500 font-medium">
										Cancel
									</Text>
								</TouchableOpacity>
								<Text className="text-base font-semibold text-gray-800">
									Select Date
								</Text>
								<TouchableOpacity
									onPress={() => {
										const selected =
											tempDate || currentDate;
										onConfirm(selected);
									}}
								>
									<Text className="text-base text-blue-500 font-semibold">
										Done
									</Text>
								</TouchableOpacity>
							</View>

							{/* Calendar Picker */}
							<View className="px-4 py-4">
								<CalendarPicker
									selectedDayColor="#dc2626"
									selectedDayTextColor="#ffffff"
									todayBackgroundColor="#f3f4f6"
									onDateChange={(date) => {
										setTempDate(date);
									}}
								/>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	);
}
