import EventCustomFieldRenderer from "@/components/Events/EventCustomFieldRenderer";
import { EventCustomField } from "@/services/Event/event.type";
import { getVisibleCustomFields } from "@/utils/eventCustomFields";
import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { Text, View } from "react-native";

type EventCustomFieldsSectionProps = {
	fields: EventCustomField[] | undefined;
	control: Control<any>;
	errors: FieldErrors;
	disabled?: boolean;
};

const EventCustomFieldsSection = ({
	fields,
	control,
	errors,
	disabled = false,
}: EventCustomFieldsSectionProps) => {
	const visibleFields = getVisibleCustomFields(fields);

	if (visibleFields.length === 0) return null;

	return (
		<View className="gap-4">
			<Text className="text-base font-semibold text-text px-1">
				Additional Information
			</Text>
			{visibleFields.map((field) => (
				<EventCustomFieldRenderer
					key={field.key}
					field={field}
					control={control}
					errors={errors}
					disabled={disabled}
				/>
			))}
		</View>
	);
};

export default EventCustomFieldsSection;
