import React from "react";
import { Controller } from "react-hook-form";
import { Text, View } from "react-native";
import { Switch } from "react-native-paper";

type FormSwitchProps = {
	name: string;
	label: string;
	control: any;
	disabled?: boolean;
};

export const FormSwitch = ({
	name,
	label,
	control,
	disabled = false,
}: FormSwitchProps) => (
	<View className="flex-row items-center justify-between py-2">
		<Text className="text-sm font-medium text-text pl-1 flex-1 pr-4">
			{label}
		</Text>
		<Controller
			control={control}
			name={name}
			render={({ field: { onChange, value } }) => (
				<Switch
					value={Boolean(value)}
					onValueChange={onChange}
					disabled={disabled}
				/>
			)}
		/>
	</View>
);
