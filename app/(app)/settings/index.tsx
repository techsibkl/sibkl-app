import SharedBody from "@/components/shared/SharedBody";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import {
	CircleQuestionMark,
	LockKeyhole,
	SquareArrowRight,
	ThumbsUpIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import {
	Alert,
	Linking,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function SettingsScreen() {
	const { signOut } = useAuthStore();
	const router = useRouter();
	const [darkTheme, setDarkTheme] = useState(true);

	const handleLogout = () => {
		Alert.alert("Logout", "Are you sure you want to logout?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Logout",
				style: "destructive",
				onPress: async () => await signOut(),
			},
		]);
	};

	const settingsOptions = [
		// {
		// 	id: "darkTheme",
		// 	icon: <Moon className="w-6 h-6 text-gray-400" />,
		// 	title: "Dark Theme Toggle",
		// 	subtitle: "Switch between dark and light mode",
		// 	hasToggle: true,
		// 	toggleValue: darkTheme,
		// 	onToggle: setDarkTheme,
		// },
		// {
		// 	id: "changeEmail",
		// 	icon: <Mail className="w-6 h-6 text-gray-400" />,
		// 	title: "Change email",
		// 	subtitle: "Update your email address",
		// 	onPress: () => router.push("/(app)/settings/changeEmail"),
		// },
		{
			id: "faqs",
			icon: <CircleQuestionMark className="w-6 h-6 text-gray-400" />,
			title: "FAQs",
			subtitle: "Frequently asked questions",
			onPress: () => router.push("/(app)/settings/faq/"),
		},
		{
			id: "changePassword",
			icon: <LockKeyhole className="w-6 h-6 text-gray-400" />,
			title: "Change password",
			subtitle: "••••••••",
			onPress: () => router.push("/(app)/settings/changePassword"),
		},
		{
			id: "feedback",
			icon: <ThumbsUpIcon className="w-6 h-6 text-gray-400" />,
			title: "Feedback Form",
			subtitle: "Submit your feedback here",
			onPress: () =>
				Linking.openURL("https://forms.gle/PWixJJ5dYgSVuqXv6"),
		},
		// {
		// 	id: "privacyPolicy",
		// 	icon: <FileText className="w-6 h-6 text-gray-400" />,
		// 	title: "Privacy Policy",
		// 	subtitle: "View our privacy policy",
		// 	onPress: () => console.log("Privacy Policy pressed"),
		// },

		{
			id: "logout",
			icon: <SquareArrowRight className="w-6 h-6 text-red-700" />,
			title: "Logout",
			subtitle: "Sign out of your account",
			isDestructive: true,
			onPress: handleLogout,
		},
	];

	return (
		<SharedBody>
			{/* Settings Options */}
			<View className="flex-1 px-4">
				{settingsOptions.map((option, index) => (
					<TouchableOpacity
						key={option.id}
						className="flex-row items-center py-4 "
						onPress={option.onPress}
						disabled={option.hasToggle}
						activeOpacity={1} // 👈 prevents fading
					>
						{/* Icon */}
						<View className="w-10 h-10 items-center justify-center mr-4">
							{option.icon}
						</View>

						{/* Content */}
						<View className="flex-1">
							<Text
								className={`text-lg font-medium ${option.isDestructive ? "text-red-500" : "text-text"}`}
							>
								{option.title}
							</Text>
							<Text className="text-gray-400 text-sm mt-1">
								{option.subtitle}
							</Text>
						</View>

						{/* Right Side */}
						{option.hasToggle ? (
							<Switch
								className="mr-4"
								value={option.toggleValue}
								onValueChange={option.onToggle}
								trackColor={{
									false: "#374151",
									true: "#10B981",
								}}
								thumbColor={
									option.toggleValue ? "#ffffff" : "#9CA3AF"
								}
							/>
						) : (
							<View className="w-6 h-6 items-center justify-center">
								<Text className="text-gray-400 text-lg">›</Text>
							</View>
						)}
					</TouchableOpacity>
				))}
			</View>
		</SharedBody>
	);
}
