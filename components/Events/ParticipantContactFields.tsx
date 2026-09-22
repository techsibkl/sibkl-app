import { FormField } from "@/components/shared/FormField";
import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { Text, View } from "react-native";

type ParticipantContactFieldsProps = {
	control: Control<any>;
	errors: FieldErrors;
	disabled?: boolean;
};

const ParticipantContactFields = ({
	control,
	errors,
	disabled = false,
}: ParticipantContactFieldsProps) => (
	<View className="gap-4">
		<Text className="text-base font-semibold text-text px-1">
			Contact Details
		</Text>
		<FormField
			name="full_name"
			label="Full Name"
			control={control}
			errors={errors}
			disabled={disabled}
			rules={{ required: "Full name is required." }}
		/>
		<FormField
			name="email"
			label="Email Address"
			control={control}
			errors={errors}
			keyboardType="email-address"
			disabled={disabled}
		/>
		<FormField
			name="phone"
			label="Mobile Number"
			control={control}
			errors={errors}
			keyboardType="phone-pad"
			disabled={disabled}
		/>
	</View>
);

export default ParticipantContactFields;
