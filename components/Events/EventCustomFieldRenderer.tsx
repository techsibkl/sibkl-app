import { EventCustomField } from "@/services/Event/event.type";
import { FormDateInput } from "@/components/shared/FormDateInput";
import { FormField } from "@/components/shared/FormField";
import { FormSelect } from "@/components/shared/FormSelect";
import { FormSwitch } from "@/components/shared/FormSwitch";
import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { Text, View } from "react-native";

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
					<FormField
						name={fieldName}
						label={field.label}
						control={control}
						keyboardType="phone-pad"
						disabled={disabled}
					/>
					{errorFooter}
				</View>
			);
		case "date":
			return (
				<View>
					<FormDateInput
						name={fieldName}
						label={field.label}
						control={control}
						disabled={disabled}
					/>
					{errorFooter}
				</View>
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

export default EventCustomFieldRenderer;
