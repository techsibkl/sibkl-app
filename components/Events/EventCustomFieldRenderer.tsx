import ConsistentPicker from "@/components/DatePickers/ConsistentPicker";
import { FormField } from "@/components/shared/FormField";
import { FormSelect } from "@/components/shared/FormSelect";
import { FormSwitch } from "@/components/shared/FormSwitch";
import { PhoneFormField } from "@/components/shared/PhoneFormField";
import { formStyles } from "@/constants/const_styles";
import { EventCustomField } from "@/services/Event/event.type";
import { formatLocalDate, parseCalendarDate } from "@/utils/localDate";
import React, { useState } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";

type EventCustomFieldRendererProps = {
	field: EventCustomField;
	control: Control<any>;
	errors: FieldErrors;
	disabled?: boolean;
};

const EventCustomFieldRenderer = ({
	field,
	control,
	errors,
	disabled = false,
}: EventCustomFieldRendererProps) => {
	const fieldName = `metadata.${field.key}` as const;
	const metadataErrors = errors.metadata as
		| Record<string, { message?: string }>
		| undefined;
	const errorMessage = metadataErrors?.[field.key]?.message;

	const errorFooter = errorMessage ? (
		<Text className="text-primary-500 text-sm pl-1 mt-1">{errorMessage}</Text>
	) : null;

	if (field.type === "select" && (!field.options || field.options.length === 0)) {
		return null;
	}

	switch (field.type) {
		case "boolean":
			return (
				<View>
					<FormSwitch
						name={fieldName}
						label={field.label}
						control={control}
						disabled={disabled}
					/>
					{errorFooter}
				</View>
			);
		case "select":
			return (
				<View>
					<FormSelect
						name={fieldName}
						label={field.label}
						control={control}
						options={field.options ?? []}
						placeholder={`Select ${field.label.toLowerCase()}...`}
						disabled={disabled}
					/>
					{errorFooter}
				</View>
			);
		case "number":
			return (
				<View>
					<FormField
						name={fieldName}
						label={field.label}
						control={control}
						keyboardType="numeric"
						disabled={disabled}
					/>
					{errorFooter}
				</View>
			);
		case "email":
			return (
				<View>
					<FormField
						name={fieldName}
						label={field.label}
						control={control}
						keyboardType="email-address"
						disabled={disabled}
					/>
					{errorFooter}
				</View>
			);
		case "phone":
			return (
				<View>
					<PhoneFormField
						name={fieldName}
						label={field.label}
						control={control}
						disabled={disabled}
					/>
					{errorFooter}
				</View>
			);
		case "date":
			return (
				<EventCustomDateField
					name={fieldName}
					label={field.label}
					control={control}
					disabled={disabled}
					errorMessage={errorMessage}
				/>
			);
		case "text":
		default:
			return (
				<View>
					<FormField
						name={fieldName}
						label={field.label}
						control={control}
						disabled={disabled}
					/>
					{errorFooter}
				</View>
			);
	}
};

function EventCustomDateField({
	name,
	label,
	control,
	disabled,
	errorMessage,
}: {
	name: string;
	label: string;
	control: Control<any>;
	disabled: boolean;
	errorMessage?: string;
}) {
	const [open, setOpen] = useState(false);

	return (
		<View>
			<Text className="text-sm font-medium text-text pl-1 mb-2">
				{label}
			</Text>
			<Controller
				control={control}
				name={name}
				render={({ field: { onChange, value } }) => {
					const selected = parseCalendarDate(value);
					return (
						<>
							<TouchableOpacity
								disabled={disabled}
								className={`${formStyles.inputDate} ${disabled ? "opacity-50" : ""}`}
								onPress={() => setOpen(true)}
							>
								<Text
									className={
										selected ? "text-gray-900" : "text-gray-400"
									}
								>
									{selected
										? selected.toLocaleDateString()
										: "Select a date"}
								</Text>
							</TouchableOpacity>
							<ConsistentPicker
								open={open}
								date={selected}
								onConfirm={(date) => {
									onChange(formatLocalDate(date));
									setOpen(false);
								}}
								onCancel={() => setOpen(false)}
							/>
						</>
					);
				}}
			/>
			{errorMessage ? (
				<Text className="text-primary-500 text-sm pl-1 mt-1">
					{errorMessage}
				</Text>
			) : null}
		</View>
	);
}

export default EventCustomFieldRenderer;
