import { FlowStep } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { CircleDashedIcon } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type PeopleFlowDialogProps = {
	onDismiss: () => void;
	personFlow: PeopleFlow;
	step?: FlowStep | null;
	colors: { bg: string; text: string };
};

const PeopleFlowDialog = ({
	onDismiss,
	personFlow,
	step,
	colors,
}: PeopleFlowDialogProps) => {
	return (
		<View
			className="flex-col pt-4 bg-white rounded-[15px] overflow-hidden items-center justify-start"
			style={{
				shadowRadius: 5, // Override the default blur
				shadowOpacity: 0.05,
			}}
		>
			{/* Flow Step information */}
			<View className="flex-col px-16 gap-2">
				<View
					className="flex-row py-1.5 rounded-full items-center justify-center gap-2"
					style={{ backgroundColor: colors.bg }}
				>
					<CircleDashedIcon size={12} color={colors.text} />
					<Text
						className="font-semibold"
						style={{ color: colors.text }}
					>
						{step?.label ?? "Not Started"}
					</Text>
				</View>
				<Text
					className="text-gray-600  text-center"
					numberOfLines={4}
					ellipsizeMode="tail"
				>
					{step?.description ?? "No description available"}
				</Text>
			</View>
			{/* Profile Info */}
			<View className="mt-2 px-16 items-center gap-1">
				<Image
					source={require("../../assets/images/person.png")}
					className="w-24 h-24 rounded-full border-4 border-white"
				/>

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
					{personFlow.p__phone ?? "-"}
				</Text>
			</View>
			{/* Open File */}
			<TouchableOpacity
				className="w-full py-6 mt-4 items-center justify-center border-t border-border"
				onPress={() => {}}
			>
				<Text className="text-blue-500 font-semibold">
					Perform Action
				</Text>
			</TouchableOpacity>

			{/* Share */}
			<TouchableOpacity
				className="w-full py-6 items-center justify-center border-t border-border"
				onPress={onDismiss}
			>
				<View className="flex-row items-center gap-2">
					<Text className="text-gray-500">Cancel</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
};

export default PeopleFlowDialog;
