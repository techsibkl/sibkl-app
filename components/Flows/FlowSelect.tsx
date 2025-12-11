import { Flow } from "@/services/Flow/flow.types";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { View } from "react-native";

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
				className={`pl-4 h-12 flex border border-border rounded-[15px] bg-white justify-center`}
			>
				<Picker
					placeholder="Select a flow"
					onValueChange={(v) => onSelect(v)}
					selectedValue={selectedFlowId}
					className="font-bold"
					style={{ fontSize: 12, borderRadius: 40, fontWeight: 900 }}
				>
					<Picker.Item label="ALL (assigned to me)" value={0} />

					{flows.map((f) => (
						<Picker.Item key={f.id} label={f.title} value={f.id} />
					))}
				</Picker>
			</View>
		</View>
	);
};

export default FlowSelector;
