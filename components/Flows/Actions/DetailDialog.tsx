import { FormDateInput } from "@/components/shared/FormDateInput";
import { FormField } from "@/components/shared/FormField";
import { FormSelect } from "@/components/shared/FormSelect";
import { updatePeopleFlowSingleCustomAttr } from "@/services/Flow/flow.service";
import { SingleCustomAttr, StepAction } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { myToast } from "@/utils/helper";
import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type StepActionDetailDialogProps = {
	onDismiss: () => void;
	onSuccess: (newValue: any) => void; // Called with the submitted value on success
	action: StepAction;
	personFlow: PeopleFlow;
	custom_attr?: { [key: string]: SingleCustomAttr };
};

const StepActionDetailDialog = ({
	onDismiss,
	onSuccess,
	action,
	personFlow,
	custom_attr,
}: StepActionDetailDialogProps) => {
	const [isloading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const field = custom_attr?.[action.source];
	const changeVal = useMemo(() => {
		let _temp = personFlow[action.source]
			? String(personFlow[action.source])
			: field?.default_value;
		if (field?.type == "Date" && !_temp) {
			_temp = new Date(Date.now());
		}
		return _temp;
	}, [action.value]);

	const { control, getValues } = useForm({
		defaultValues: {
			value: changeVal,
		},
	});

	const updateField = async () => {
		setIsLoading(true);
		const submittedValue = getValues("value") ?? action.value;
		const res = await updatePeopleFlowSingleCustomAttr(
			personFlow.flow_id ?? 1,
			personFlow,
			action.source,
			submittedValue,
			field?.label ?? "",
		);
		Toast.show(myToast(res));
		setIsLoading(false);
		if (res.success) {
			// Invalidate the specific flow query this person belongs to
			queryClient.invalidateQueries({
				queryKey: ["peopleFlow", personFlow.flow_id ?? "all"],
			});
			// Also invalidate the assignee-scoped "all flows" query if it exists
			queryClient.invalidateQueries({
				queryKey: ["peopleFlow", "all"],
			});
			onSuccess(submittedValue);
		}
	};
	return (
		<View
			className="w-full bg-white rounded-[15px] overflow-hidden"
			style={{
				shadowRadius: 5,
				shadowOpacity: 0.05,
			}}
		>
			<View className="flex flex-col py-10 px-8">
				{/* Profile Info */}
				<View className="mt-2 mb-6 pb-6 items-center gap-1 border-b border-border">
					<Text
						className="text-text text-xl font-bold"
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{personFlow.p__full_legal_name}
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
				{field?.type == "Text" && (
					<FormField
						name="value"
						control={control}
						label={field.label}
						placeholder={`Enter "${field.label}"`}
						disabled={!!action.value}
					/>
				)}
				{field?.type == "Options" && (
					<FormSelect
						name="value"
						control={control}
						label={field.label}
						options={field.value as []}
						disabled={!!action.value}
					/>
				)}
				{field?.type == "Date" && (
					<FormDateInput
						name="value"
						control={control}
						label={field.label}
						disabled={!!action.value}
					/>
				)}
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
