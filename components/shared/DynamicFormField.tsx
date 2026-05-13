import { resolveInputComponent } from "@/constants/const_person";
import { TableField } from "@/types/TableField.type";
import React from "react";
import { Control, FieldErrors } from "react-hook-form";

type DynamicFormFieldProps = {
	field: TableField;
	control: Control<any>;
	errors: FieldErrors;
	onFieldUpdate?: (key: string, value: any) => void;
	onFieldComplete?: (key: string, value: any) => void;
	disabled?: boolean;
	placeholder?: string;
};

// components/DynamicFormField.tsx
const DynamicFormField = ({
	field,
	control,
	errors,
	onFieldUpdate,
	onFieldComplete,
	disabled,
	placeholder = `${field.header}`,
}: DynamicFormFieldProps) => {
	const InputComponent = resolveInputComponent(field);
	const fieldKey = field.ori_key || field.key;
	return (
		<InputComponent
			name={fieldKey}
			label={field.header}
			control={control}
			errors={errors}
			placeholder={placeholder}
			options={field.options} // Will be used by FormSelect
			disabled={field.editable === false || disabled}
			onChangeText={(value: any) => onFieldUpdate?.(fieldKey, value)}
			onBlur={(value: any) => onFieldComplete?.(fieldKey, value)} // Pass it through
		/>
	);
};

export default DynamicFormField;
