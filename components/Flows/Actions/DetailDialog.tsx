import { FormDateInput } from "@/components/shared/FormDateInput";
import { FormField } from "@/components/shared/FormField";
import { FormSelect, Option } from "@/components/shared/FormSelect";
import { updatePeopleFlowSingleCustomAttr } from "@/services/Flow/flow.service";
import { SingleCustomAttr, StepAction } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { myToast } from "@/utils/helper";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type StepActionDetailDialogProps = {
	onDismiss: () => void;
	action: StepAction;
	personFlow: PeopleFlow;
	custom_attr?: { [key: string]: SingleCustomAttr };
};

const StepActionDetailDialog = ({
	onDismiss,
	action,
	personFlow,
	custom_attr,
}: StepActionDetailDialogProps) => {
	const [isloading, setIsLoading] = useState(false);

	const field = custom_attr?.[action.source];
	// Change to set action value, if null then use custom_attr.default_value
	const changeVal = useMemo(() => {
		let _temp = action.value ? String(action.value) : field?.default_value;

		if (field?.type == "Date" && !_temp) {
			_temp = new Date(Date.now());
		}
		return _temp;
	}, [action.value]);

	const options: Option[] =
		field?.type == "Options"
			? (field?.value as []).map((val) => {
					return {
						label: val,
						value: val,
					};
				})
			: [];

	const {
		control,
		handleSubmit,
		getValues,

		reset,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			value: changeVal,
		},
	});

	const updateField = async () => {
		setIsLoading(true);
		const res = await updatePeopleFlowSingleCustomAttr(
			personFlow.flow_id ?? 1,
			personFlow,
			action.source,
			getValues("value") ?? action.value,
			field?.label ?? ""
		);
		Toast.show(myToast(res));
		if (res.success) {
			setIsLoading(true);
			onDismiss();
		}
	};

	return (
		<View
			className="w-full bg-white rounded-[15px] overflow-hidden"
			style={{
				shadowRadius: 5, // Override the default blur
				shadowOpacity: 0.05,
			}}
		>
			<View className="flex flex-col pt-10 px-8">
				{/* Profile Info */}
				<View className="mt-2 mb-6 pb-6 items-center gap-1 border-b border-border ">
					<Text
						className="text-text text-xl font-bold "
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{personFlow.p__full_name}
					</Text>
					<Text
						className="text-text text-blue-600"
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						Set a value to update profile
					</Text>
				</View>
				{/* Editor */}
				{(field?.type == "Text" && (
					<FormField
						name={"value"}
						control={control}
						label={field.label}
						placeholder={`Enter "${field.label}"`}
						disabled={action.value ? true : false}
					></FormField>
				)) ||
					(field?.type == "Options" && (
						<FormSelect
							name="value"
							control={control}
							label={field.label}
							options={options}
							disabled={action.value ? true : false}
						></FormSelect>
					)) ||
					(field?.type == "Date" && (
						<FormDateInput
							name="value"
							control={control}
							label={field.label}
							disabled={action.value ? true : false}
						></FormDateInput>
					))}
			</View>

			<TouchableOpacity
				className="w-full py-6 items-center justify-center border-t border-border"
				onPress={updateField}
				disabled={isloading}
			>
				<View className="flex-row items-center gap-2">
					{isloading ? (
						<ActivityIndicator
							size="small"
							className="text-blue-500"
						/>
					) : (
						<Text className="font-semibold text-blue-500">
							Update
						</Text>
					)}
				</View>
			</TouchableOpacity>
		</View>
	);
};

export default StepActionDetailDialog;
