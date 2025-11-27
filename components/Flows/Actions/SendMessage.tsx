import { StepAction } from "@/services/Flow/flow.types";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { displayDateAsStr, formatPhone } from "@/utils/helper";
import { ArrowRight, MessageCircle } from "lucide-react-native";
import React from "react";
import {
    Alert,
    Linking,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
type Props = {
	action: StepAction;
	personFlow: PeopleFlow;
};
const SendMessageAction = ({ action, personFlow }: Props) => {
	const preview =
		typeof action.value === "string"
			? action.value.slice(0, 60)
			: "(message)";

	const convertToWhatsApp = (html: string) => {
		const text = html
			.replace(/<p>\s*/g, "") // Remove opening <p> tags
			.replace(/<\/p>\s*/g, "\n") // Replace closing </p> with newline
			.replace(/<br\s*\/?>/g, "\n") // Replace <br> with newline
			.replace(/<strong>(.*?)<\/strong>/g, "*$1*") // Convert <strong> to *bold*
			.replace(/&nbsp;/g, " ") // Convert &nbsp; to space
			.replace(/&amp;/g, "&") // Convert &amp; to &
			.replace(/&lt;/g, "<") // Convert &lt; to <
			.replace(/&gt;/g, ">") // Convert &gt; to >
			.replace(/&quot;/g, '"') // Convert &quot; to "
			.replace(/&#39;/g, "'") // Convert HTML entity for apostrophe
			.trim();

		return text;
	};

	// Send Whastapp message
	const sendWhatsApp = async (person: PeopleFlow) => {
		let phone = formatPhone(person.p__phone);
		// let message = convertToWhatsApp(whatsappTemplate.value);
		let message = "Hello there, {{p__full_name}}!";

		message = message.replace(/{{(.*?)}}/g, (match, p1) => {
			let attr = p1.trim();
			return displayDateAsStr(person[attr]) || "";
		});
		// message = encodeURIComponent(message);
		// const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
		const url = `tg://msg?text=${encodeURIComponent(message)}`;
		openWhatsApp(phone, encodeURIComponent(message));
		// openTelegram("wongzy", encodeURIComponent(message));

		// window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
		// await flowStore.updateLastContacted(id, [person.people_id ?? 0]);
	};

	const openWhatsApp = async (phone: string, message: string) => {
		try {
			const formattedMessage = encodeURIComponent(message);
			let url = `whatsapp://send?phone=${phone}&text=${formattedMessage}`;

			// iOS requires different scheme sometimes
			if (Platform.OS === "ios") {
				url = `whatsapp://send?text=${formattedMessage}&phone=${phone}`;
			}

			const supported = await Linking.canOpenURL(url);
			if (!supported) {
				Alert.alert(
					"WhatsApp not installed",
					"Please install WhatsApp to send a message."
				);
				return;
			}

			await Linking.openURL(url);
		} catch (error) {
			console.error("Failed to open WhatsApp:", error);
		}
	};

	// const openTelegram = async (username: string, message: string) => {
	// 	const appUrl = `tg://resolve?domain=${username}&text=${encodeURIComponent(message)}`;
	// 	const webUrl = `https://t.me/${username}`;

	// 	try {
	// 		const supported = await Linking.canOpenURL(appUrl);

	// 		if (supported) {
	// 			await Linking.openURL(appUrl);
	// 		} else {
	// 			// Fallback to web URL
	// 			await Linking.openURL(webUrl);
	// 		}
	// 	} catch (err) {
	// 		console.error("Failed to open Telegram:", err);
	// 		Alert.alert("Error", "Cannot open Telegram.");
	// 	}
	// };

	return (
		<TouchableOpacity
			className="flex-row items-center gap-3 bg-white p-4 rounded-xl shadow"
			activeOpacity={0.7}
			onPress={() => sendWhatsApp(personFlow)}
		>
			<View className="p-2 rounded-full bg-green-100">
				<MessageCircle size={18} color={"#388e3c"} />
			</View>

			<View className="flex-1">
				<Text className="font-semibold text-base">Send message</Text>
				<Text className="text-gray-500 text-sm" numberOfLines={1}>
					{preview}
				</Text>
			</View>

			<ArrowRight size={18} />
		</TouchableOpacity>
	);
};

export default SendMessageAction;
