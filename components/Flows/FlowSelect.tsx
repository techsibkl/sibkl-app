import { Flow } from "@/services/Flow/flow.types";
import React from "react";
import { Text, View } from "react-native";
import { AppPicker } from "../shared/AppPicker";

type Props = {
	flows: Flow[];
	selectedFlowId: number | null;
	onSelect: Function;
};

const FlowSelector = ({ flows, selectedFlowId, onSelect }: Props) => {
	return (
		<View className="flex-1 w-full">
			{/* <Text>Hello</Text> */}
			<View
				className={`pl-4 flex border border-border rounded-[15px] bg-white justify-center`}
			>
				<AppPicker
					value={selectedFlowId}
					onChange={(v) => onSelect(v)}
					options={[
						{ label: "ALL (assigned to me)", value: 0 },
						...flows.map((f) => ({
							label: f.title,
							value: f.id,
						})),
					]}
					renderTrigger={(label) => (
						<Text className="font-medium text-md">
							{label || "Select flow"}
						</Text>
					)}
				/>
			</View>
		</View>
	);
};

export default FlowSelector;
