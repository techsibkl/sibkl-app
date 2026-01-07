import React, { useState } from "react";
import {
	LayoutAnimation,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	UIManager,
	View,
} from "react-native";

// Enable LayoutAnimation on Android
if (
	Platform.OS === "android" &&
	UIManager.setLayoutAnimationEnabledExperimental
) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqData = [
	{
		question: "Who is this app for?",
		answer: "This app is for members, leaders, pastors of SIBKL church. (Guests can sign up but will have limited access to features)",
	},
	{
		question: "What does UAT include?",
		answer: "UAT (User Acceptance Testing) includes core features such as profile management, guest follow-up, leader's page, and announcements. Some advanced features may still be under development.",
	},
	{
		question: "When will the full version be released?",
		answer: "The full version is expected to be released in Q2 2026, after thorough testing and feedback collection during the UAT phase.",
	},
	{
		question: "How do I reset my password?",
		answer: "Go to Settings → Change Password. Enter your current password and your new password.",
	},
];

export default function FAQScreen() {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const toggleItem = (index: number) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setActiveIndex((prev) => (prev === index ? null : index));
	};

	return (
		<ScrollView className="flex-1 p-5 bg-background">
			{faqData.map((item, index) => {
				const isOpen = activeIndex === index;

				return (
					<View
						key={index}
						className="bg-white rounded-xl border border-neutral-200 mb-3 px-4 py-3"
					>
						<TouchableOpacity
							onPress={() => toggleItem(index)}
							className="flex-row justify-between items-center"
						>
							<Text className="text-base font-semibold text-neutral-800 flex-1">
								{item.question}
							</Text>

							<Text className="text-2xl font-bold text-neutral-500 px-2">
								{isOpen ? "−" : "+"}
							</Text>
						</TouchableOpacity>

						{isOpen && (
							<View className="mt-2 pr-8">
								<Text className="text-sm text-neutral-600 leading-5">
									{item.answer}
								</Text>
							</View>
						)}
					</View>
				);
			})}
		</ScrollView>
	);
}
