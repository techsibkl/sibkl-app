"use client";

import CellList from "@/components/Cells/CellList";
import NotesTab from "@/components/Flows/NotesTab";
import SharedBody from "@/components/shared/SharedBody";
import SkeletonPeopleRow from "@/components/shared/Skeleton/SkeletonPeopleRow";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { Person } from "@/services/Person/person.type";
import { displayDateAsStr, formatPhone } from "@/utils/helper";
import { getInitials } from "@/utils/helper_profile";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Mail, MapPin, Phone, User } from "lucide-react-native";
import React, { useState } from "react";
import {
	Alert,
	Clipboard,
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

	const tabs = ["Info", "Cells", "Notes", "Flows"];

	const copyPhoneToClipboard = (phone: string | undefined) => {
		if (!phone) {
			Alert.alert("Error", "No phone number available");
			return;
		}
		Clipboard.setString(phone);
		Alert.alert("Copied", "Phone number copied to clipboard");
	};

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
			case "Info":
				return renderPersonalInformation();
			case "Cells":
				return renderCellGroups();
			case "Notes":
				return (
					<NotesTab
						personFlow={
							{
								p__id: person!.id,
								p__full_legal_name: person!.full_legal_name,
								p__phone: person!.phone,
							} as any
						}
					/>
				);
			case "Flows":
				return renderFlows();
			default:
				return renderPersonalInformation();
		}
	};

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
				{/* Avatar + name + phone - Horizontal compact layout */}
				<View className="mt-4 px-6 flex-row items-center justify-center gap-3">
					<View className="w-14 h-14 rounded-full items-center justify-center flex-shrink-0 bg-gray-200">
						<Text className="text-lg font-bold text-gray-800">
							{initials}
						</Text>
					</View>
					<View className="flex-1 ">
						<Text
							className="text-text text-lg font-bold"
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{person.full_legal_name}
						</Text>
						<Text
							className="text-blue-600 text-sm"
							numberOfLines={1}
							onPress={() => sendWhatsApp(person)}
							onLongPress={() =>
								copyPhoneToClipboard(formatPhone(person.phone))
							}
						>
							{person.phone ?? "-"}
						</Text>
					</View>
				</View>
				{/* Tabs */}
				<View className="mt-6 flex-row px-6 gap-1 border-b border-border">
					{tabs.map((tab) => (
						<TouchableOpacity
							key={tab}
							className={`flex-1 py-3 px-3 rounded-t-xl items-center justify-center transition ${
								activeTab === tab
									? "bg-blue-50 border-b-2 border-blue-600"
									: ""
							}`}
							onPress={() => setActiveTab(tab)}
						>
							<Text
								className={`font-semibold text-sm ${
									activeTab === tab
										? "text-blue-600"
										: "text-gray-500"
								}`}
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
