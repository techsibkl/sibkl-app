import EventList from "@/components/Events/EventList";
import SharedBody from "@/components/shared/SharedBody";
import { SharedSearchBar } from "@/components/shared/SharedSearchBar";
import SkeletonList from "@/components/shared/Skeleton/SkeletonList";
import { useEventsQuery } from "@/hooks/Event/useEventsQuery";
import { useAuthStore } from "@/stores/authStore";
import { Redirect } from "expo-router";
import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";

const EventsPage = () => {
	const { isGuest } = useAuthStore();
	const { data: events, isPending, isError, error } = useEventsQuery();
	const [searchQuery, setSearchQuery] = useState("");

	if (isGuest) {
		return <Redirect href="/(auth)/sign-in" />;
	}

	const filtered = useMemo(() => {
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

	return (
		<SharedBody>
			<SharedSearchBar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				placeholder="Search events..."
			/>
			{isPending ? (
				<SkeletonList length={5} />
			) : isError ? (
				<View className="px-4 pt-8">
					<Text className="text-center text-red-500">
						{(error as any)?.message ??
							"Failed to load events. Please try again."}
					</Text>
				</View>
			) : (
				<EventList events={filtered} />
			)}
		</SharedBody>
	);
};

export default EventsPage;
