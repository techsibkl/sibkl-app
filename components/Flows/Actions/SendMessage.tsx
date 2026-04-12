import { useTemplateByIdQuery } from "@/hooks/Template/useTemplatesQuery";
import { StepAction } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { displayDateAsStr, formatPhone } from "@/utils/helper";
import { convertToWhatsApp } from "@/utils/helper_flows";
import { ArrowRight, MessageCircle } from "lucide-react-native";
import React, { useMemo } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

type Props = {
	action: StepAction;
	personFlow: PeopleFlow;
};
const SendMessageAction = ({ action, personFlow }: Props) => {
	const { data: template } = useTemplateByIdQuery(action.value);

	const message = useMemo(() => {
		let msg = convertToWhatsApp(template?.template ?? "Hello,");

		msg = msg.replace(/{{(.*?)}}/g, (match, p1) => {
			let attr = p1.trim();
			return displayDateAsStr(personFlow[attr]) || "";
		});

		return msg;
	}, [template?.template, personFlow]); // Recalculate when these change

	// Send Whastapp message
	const sendWhatsApp = async (person: PeopleFlow) => {
		let phone = formatPhone(person.p__phone);
		// const url = `tg://msg?text=${encodeURIComponent(message)}&to={phone}`;
		const url = `https://wa.me/${phone}?text=${message}`;
		await Linking.openURL(url);
	};

	return (
		<TouchableOpacity
			className="flex-row items-center gap-3 bg-white p-4 rounded-xl border border-border"
			activeOpacity={0.7}
			onPress={() => sendWhatsApp(personFlow)}
		>
			<View className="p-2 rounded-full bg-green-100">
				<MessageCircle size={18} color={"#388e3c"} />
			</View>

			<View className="flex-1">
				<Text className="font-semibold text-base">Send message</Text>
				<Text className="text-gray-500 text-sm" numberOfLines={1}>
					{message ?? "No preview"}
				</Text>
			</View>

			<ArrowRight size={18} />
		</TouchableOpacity>
	);
};

export default SendMessageAction;
