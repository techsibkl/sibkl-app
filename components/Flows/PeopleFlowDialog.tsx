import { ActionComponents } from "@/constants/const_flows";
import { FlowStep } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { CircleDashedIcon } from "lucide-react-native";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

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
			className="h-full w-full bg-white rounded-[15px] overflow-hidden"
			style={{
				shadowRadius: 5, // Override the default blur
				shadowOpacity: 0.05,
			}}
		>
			<ScrollView
				contentContainerStyle={{
					paddingVertical: 20,
				}}
				showsVerticalScrollIndicator={false}
			>
				{/* Flow Step information */}
				<View className="flex-col  px-16 gap-2">
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
				<View className="mt-2 px-16  items-center gap-1">
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

				{/* Actions */}
				<View className="gap-y-2 flex flex-col w-full px-6 my-4">
					{step?.actions?.map((action, i) => {
						const Component = ActionComponents[action.type];
						if (!Component) return null;

						return (
							<Component
								key={i}
								action={action}
								personFlow={personFlow}
							/>
						);
					})}
				</View>
			</ScrollView>

			{/* Share */}
			<TouchableOpacity
				className="w-full py-6 items-center justify-center border-t border-border"
				onPress={onDismiss}
			>
				<View className="flex-row items-center gap-2">
					<Text className="text-gray-500">Back</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
};

export default PeopleFlowDialog;
