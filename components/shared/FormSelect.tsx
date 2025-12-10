import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Controller } from "react-hook-form";
import { Text, View } from "react-native";

export type Option = { label: string; value: string };

export const FormSelect = ({
	name,
	label,
	control,
	rules = {},
	errors = {},
	options = [],
	disabled = false,
}: {
	name: string;
	label: string;
	control: any;
	rules?: any;
	errors?: any;
	options: Option[];
	disabled?: boolean;
}) => {
	return (
		<View className="mb-6">
			<Text className="text-sm font-medium text-text mb-2">{label}</Text>
			<Controller
				control={control}
				name={name}
				rules={rules}
				render={({ field: { onChange, value } }) => (
					<View
						className={`pl-4 h-12  border border-border rounded-[15px] bg-white justify-center`}
					>
						<Picker
							enabled={!disabled} // 👈 disables select
							selectedValue={value}
							onValueChange={(val) => onChange(val)}
							style={{ fontSize: 12, borderRadius: 40 }}
						>
							<Picker.Item label="Select an option..." value="" />
							{options.map((opt) => (
								<Picker.Item
									key={opt.value}
									label={opt.label}
									value={opt.value}
								/>
							))}
						</Picker>
					</View>
				)}
			/>
			{errors[name] && (
				<Text className="text-primary-500 text-sm mt-1">
					{errors[name]?.message}
				</Text>
			)}
		</View>
	);
};
