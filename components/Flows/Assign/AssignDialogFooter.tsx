import SharedButton from "@/components/shared/SharedButton";
import React from "react";
import { View } from "react-native";

type AssignDialogFooterProps = {
	onCancel: () => void;
	onConfirm: () => void;
	confirmLabel?: string;
	isPending?: boolean;
	disabled?: boolean;
};

const AssignDialogFooter = ({
	onCancel,
	onConfirm,
	confirmLabel = "Assign",
	isPending = false,
	disabled = false,
}: AssignDialogFooterProps) => (
	<View className="px-5 pt-4 pb-8 flex-row gap-3 border-t border-gray-100 bg-white">
		<SharedButton
			onPress={onCancel}
			title="Cancel"
			disabled={isPending}
			variant="secondary"
			className="flex-1"
		/>
		<SharedButton
			onPress={onConfirm}
			title={isPending ? "Assigning..." : confirmLabel}
			isLoading={isPending}
			disabled={disabled || isPending}
			variant="primary"
			className="flex-1"
		/>
	</View>
);

export default AssignDialogFooter;
