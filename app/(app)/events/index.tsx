import EventList from "@/components/Events/EventList";
import MyEventList from "@/components/Events/MyEventList";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import SkeletonList from "@/components/shared/Skeleton/SkeletonList";
import { useEventsQuery } from "@/hooks/Event/useEventsQuery";
import { useMyEventRegistrationsQuery } from "@/hooks/Event/useMyEventRegistrationsQuery";
import { useAuthStore } from "@/stores/authStore";
import { Redirect } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";

type BrowseTab = "all" | "mine";

const EventsPage = () => {
	const { isGuest } = useAuthStore();
	const { data: events, isPending, isError, error } = useEventsQuery();
	const {
		data: myRegistrations = [],
		isPending: myPending,
		isError: myError,
		error: myFetchError,
	} = useMyEventRegistrationsQuery();
	const [searchQuery, setSearchQuery] = useState("");
	const [browseTab, setBrowseTab] = useState<BrowseTab>("all");
	const underlinePosition = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (myRegistrations.length > 0) {
			setBrowseTab("mine");
		}
	}, []);

	useEffect(() => {
		Animated.timing(underlinePosition, {
			toValue: browseTab === "all" ? 0 : 1,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [browseTab, underlinePosition]);

	if (isGuest) {
		return <Redirect href="/(auth)/sign-in" />;
	}

	const filteredEvents = useMemo(() => {
		const all = events ?? [];
		if (!searchQuery.trim()) return all;
		const q = searchQuery.toLowerCase();
		return all.filter(
			(event) =>
				event.name?.toLowerCase().includes(q) ||
				event.venue?.toLowerCase().includes(q) ||
				event.description?.toLowerCase().includes(q),
		);
	}, [events, searchQuery]);

	const filteredRegistrations = useMemo(() => {
		if (!searchQuery.trim()) return myRegistrations;
		const q = searchQuery.toLowerCase();
		return myRegistrations.filter(
			({ event }) =>
				event.name?.toLowerCase().includes(q) ||
				event.venue?.toLowerCase().includes(q) ||
				event.description?.toLowerCase().includes(q),
		);
	}, [myRegistrations, searchQuery]);

	const isLoading = browseTab === "all" ? isPending : myPending;
	const hasError = browseTab === "all" ? isError : myError;
	const errorMessage =
		browseTab === "all"
			? (error as any)?.message
			: (myFetchError as any)?.message;

	return (
		<SharedBody>
			<SharedSearchBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				placeholder="Search events..."
			/>

			<View className="border-b border-gray-100">
				<View className="flex-row px-4">
					<Pressable
						onPress={() => setBrowseTab("all")}
						className="flex-1 py-4 px-3 items-center"
					>
						<Text
							className={`text-[15px] tracking-tight ${
								browseTab === "all"
									? "font-semibold text-gray-800"
									: "font-medium text-gray-400"
							}`}
						>
							All
						</Text>
					</Pressable>
					<Pressable
						onPress={() => setBrowseTab("mine")}
						className="flex-1 py-4 px-3 items-center"
					>
						<Text
							className={`text-[15px] tracking-tight ${
								browseTab === "mine"
									? "font-semibold text-gray-800"
									: "font-medium text-gray-400"
							}`}
						>
							My Events
						</Text>
					</Pressable>
				</View>
				<Animated.View
					className="h-[3px] w-[45%] bg-[#d6361e] rounded-sm"
					style={[
						browseTab === "all"
							? { marginLeft: 16 }
							: { marginRight: 16 },
						{
							transform: [
								{
									translateX: underlinePosition.interpolate({
										inputRange: [0, 1],
										outputRange: [0, 200],
									}),
								},
							],
						},
					]}
				/>
			</View>

			<View className="flex-1">
				{isLoading ? (
					<SkeletonList length={5} />
				) : hasError ? (
					<View className="px-4 pt-8">
						<Text className="text-center text-red-500">
							{errorMessage ??
								"Failed to load events. Please try again."}
						</Text>
					</View>
				) : browseTab === "all" ? (
					<EventList events={filteredEvents} />
				) : (
					<MyEventList
						registrations={filteredRegistrations}
						onBrowseEvents={() => setBrowseTab("all")}
					/>
				)}
			</View>
		</SharedBody>
	);
};

export default EventsPage;
