"use client";

import CellList from "@/components/Cells/CellList";
import SharedBody from "@/components/shared/SharedBody";
import SkeletonPeopleRow from "@/components/shared/Skeleton/SkeletonPeopleRow";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { Person } from "@/services/Person/person.type";
import { displayDateAsStr, formatPhone } from "@/utils/helper";
import { getAvatarColors, getInitials } from "@/utils/helper_profile";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Mail, MapPin, Phone, User } from "lucide-react-native";
import React, { useState } from "react";
import {
	Linking,
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const ProfileScreen = () => {
	const [activeTab, setActiveTab] = useState("Info");
	const router = useRouter();
	const { id, backPath } = useLocalSearchParams();

	const {
		data: person,
		isPending,
		error,
		isError,
	} = useSinglePersonQuery(Number(id));

	const tabs = ["Info", "Cells", "Flows"];

	const renderPersonalInformation = () => (
		<View className="px-5 py-6">
			<View className="bg-white rounded-2xl p-6 shadow-sm">
				<Text className="text-lg font-semibold text-gray-800 mb-4">
					Contact Information
				</Text>

				<View className="space-y-4">
					<View className="flex-row items-center py-3 border-b border-gray-100">
						<Phone
							size={20}
							color="#d6361e" // Tailwind's primary-500 hex value
							style={{ marginRight: 12 }}
						/>
						<View className="flex-1">
							<Text className="text-sm text-gray-500">Phone</Text>
							<Text className="text-base text-gray-800 font-medium">
								{person?.phone}
							</Text>
						</View>
					</View>

					<View className="flex-row items-center py-3 border-b border-gray-100">
						<Mail
							size={20}
							color="#d6361e" // Tailwind's primary-500 hex value
							style={{ marginRight: 12 }}
						/>
						<View className="flex-1">
							<Text className="text-sm text-gray-500">Email</Text>
							<Text className="text-base text-gray-800 font-medium">
								{person?.email}
							</Text>
						</View>
					</View>

					<View className="flex-row items-center py-3 border-b border-gray-100">
						<MapPin
							size={20}
							color="#d6361e" // Tailwind's primary-500 hex value
							style={{ marginRight: 12 }}
						/>
						<View className="flex-1">
							<Text className="text-sm text-gray-500">
								Address
							</Text>
							<Text className="text-base text-gray-800 font-medium">
								{person?.full_home_address}
							</Text>
						</View>
					</View>

					<View className="flex-row items-center py-3 border-b border-gray-100">
						<Calendar
							size={20}
							color="#d6361e" // Tailwind's primary-500 hex value
							style={{ marginRight: 12 }}
						/>
						<View className="flex-1">
							<Text className="text-sm text-gray-500">
								Date of Birth
							</Text>
							<Text className="text-base text-gray-800 font-medium">
								{displayDateAsStr(person?.birth_date)}
							</Text>
						</View>
					</View>

					<View className="flex-row items-center py-3">
						<User
							size={20}
							color="#d6361e" // Tailwind's primary-500 hex value
							style={{ marginRight: 12 }}
						/>
						<View className="flex-1">
							<Text className="text-sm text-gray-500">
								Emergency Contact
							</Text>
							<Text className="text-base text-gray-800 font-medium">
								{person?.emergency_contact_name}
							</Text>
						</View>
					</View>
				</View>
			</View>
		</View>
	);

	const renderCellGroups = () => (
		<View className=" mx-6 mt-4">
			<CellList cells={person?.cells!} />
		</View>
	);

	if (isPending)
		return (
			<SharedBody>
				<SkeletonPeopleRow />
			</SharedBody>
		);
	if (isError)
		return (
			<SharedBody>
				<Text>{error.message}</Text>
				<Text>{error.name}</Text>
			</SharedBody>
		);

	const renderFlows = () => (
		<View className="px-5 py-6">
			<View className="flex-1 justify-center items-center py-24">
				<Ionicons name="git-branch-outline" size={80} color="#666" />
				<Text className="text-2xl font-semibold text-gray-800 mt-5 mb-2">
					Flows Coming Soon
				</Text>
				<Text className="text-base text-gray-500 text-center px-10 leading-6">
					This section is being developed and will be available soon
				</Text>
			</View>
		</View>
	);

	const renderTabContent = () => {
		switch (activeTab) {
			case "Personal Information":
				return renderPersonalInformation();
			case "Cells":
				return renderCellGroups();
			case "Flows":
				return renderFlows();
			default:
				return renderPersonalInformation();
		}
	};

	const avatarColors = getAvatarColors(undefined);
	const initials = getInitials(person.full_legal_name);

	const sendWhatsApp = async (person: Person) => {
		let phone = formatPhone(person.p__phone);
		const url = `https://wa.me/${phone}?text=Hello%20${encodeURIComponent(person.full_legal_name!)},`;
		await Linking.openURL(url);
	};

	return (
		<>
			<SharedBody>
				<StatusBar barStyle="dark-content" />
				{/* Avatar + name + phone */}
				<View className="mt-4 px-16 items-center gap-1">
					<View
						className="w-20 h-20 rounded-full items-center justify-center mb-1 border border-gray-300"
						style={{ backgroundColor: avatarColors.bg }}
					>
						<Text
							className="text-2xl font-bold"
							style={{ color: avatarColors.text }}
						>
							{initials}
						</Text>
					</View>
					<Text
						className="text-text text-xl font-bold"
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{person.full_legal_name}
					</Text>
					<Text
						className="text-blue-600"
						numberOfLines={1}
						onPress={() => sendWhatsApp(person)}
					>
						{person.phone ?? "-"}
					</Text>
				</View>
				{/* Tabs */}
				<View className="mt-6 w-full flex-row gap-4 justify-center items-center">
					{tabs.map((tab) => (
						<TouchableOpacity
							key={tab}
							onPress={() => setActiveTab(tab)}
							className={`px-4 py-2 rounded-full ${activeTab === tab ? "bg-primary-500" : "bg-background-secondary"}`}
						>
							<Text
								className={`font-medium ${activeTab === tab ? "text-white" : "text-gray-600"}`}
							>
								{tab}
							</Text>
						</TouchableOpacity>
					))}
				</View>
				{/* Tab Content */}
				<ScrollView
					className="flex-1"
					showsVerticalScrollIndicator={false}
				>
					{renderTabContent()}
				</ScrollView>
			</SharedBody>
		</>
	);
};

export default ProfileScreen;
