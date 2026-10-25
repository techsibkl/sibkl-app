import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { usePeopleFlowAllQuery } from "@/hooks/Flows/useFlowsQuery";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { useAuthStore } from "@/stores/authStore";
import { Notification } from "@/types/Notification.type";
import {
	formatCompactDateBadge,
	getNextCellMeeting,
} from "@/utils/cellMeeting";
import { useRouter } from "expo-router";
import { CalendarDays, ChevronRightIcon, FunnelIcon } from "lucide-react-native";
import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import QueryErrorState from "../shared/QueryErrorState";
import { Colors } from "@/constants/Colors";

const MAX_ROWS = 3;

type Props = {
	notifications: Notification[];
	isPending?: boolean;
	isError?: boolean;
	onRetry?: () => void;
	isRetrying?: boolean;
};

const navigateNotification = (
	router: ReturnType<typeof useRouter>,
	notification: Notification,
) => {
	if (notification.type === "flow") {
		router.push(
			`/(app)/flows?flow_id=${notification.ref_id}&isMeMode=true`,
		);
	} else if (notification.type === "resources") {
		router.push(`/(app)/leaders?resource_id=${notification.ref_id}`);
	} else if (notification.type === "announcements") {
		router.push(
			`/(app)/announcements?announcement_id=${notification.ref_id}`,
		);
	}
};

const ForYouSection = ({
	notifications,
	isPending,
	isError,
	onRetry,
	isRetrying,
}: Props) => {
	const router = useRouter();
	const { user, isGuest } = useAuthStore();
	const personId = user?.person?.id ?? -1;
	const showGuestFollowUp = useFeatureFlag("guestFollowUp");
	const showCells = useFeatureFlag("cells");

	const { data: person } = useSinglePersonQuery(personId);
	const { data: allPeople } = usePeopleFlowAllQuery();

	const nextMeeting = useMemo(() => {
		if (isGuest || !showCells) return null;
		return getNextCellMeeting(person?.cells);
	}, [person?.cells, isGuest, showCells]);

	const assignmentStats = useMemo(() => {
		if (!showGuestFollowUp || isGuest || personId <= 0) {
			return { total: 0, newToday: 0 };
		}
		const mine =
			allPeople?.filter(
				(p) =>
					Number(p.assignee_id) === personId &&
					p.completed !== true,
			) ?? [];
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const newToday = mine.filter((p) => {
			if (!p.last_assigned_at) return false;
			const d = new Date(p.last_assigned_at);
			d.setHours(0, 0, 0, 0);
			return d.getTime() === today.getTime();
		}).length;
		return { total: mine.length, newToday };
	}, [allPeople, personId, showGuestFollowUp, isGuest]);

	const recentNotifications = useMemo(
		() =>
			notifications
				.filter((n) => n.type !== "flow")
				.slice(0, MAX_ROWS),
		[notifications],
	);

	type Row =
		| { kind: "cell" }
		| { kind: "followUp" }
		| { kind: "notification"; notification: Notification };

	const rows: Row[] = useMemo(() => {
		const list: Row[] = [];
		if (nextMeeting) list.push({ kind: "cell" });
		if (assignmentStats.total > 0 && showGuestFollowUp) {
			list.push({ kind: "followUp" });
		}
		for (const notification of recentNotifications) {
			if (list.length >= MAX_ROWS) break;
			list.push({ kind: "notification", notification });
		}
		return list.slice(0, MAX_ROWS);
	}, [
		nextMeeting,
		assignmentStats.total,
		showGuestFollowUp,
		recentNotifications,
	]);

	const showEmpty =
		!isPending && !isError && rows.length === 0;

	return (
		<View className="mb-8">
			<View className="flex-row items-center justify-between px-4 mb-3">
				<Text className="text-xl text-black font-bold">For you</Text>
				<Pressable
					className="flex-row items-center active:opacity-70"
					onPress={() => router.push("/(app)/notifications")}
				>
					<Text className="font-regular text-black text-sm mr-1">
						See all
					</Text>
					<ChevronRightIcon size={16} />
				</Pressable>
			</View>

			{isError ? (
				<View className="min-h-[120px] mx-4">
					<QueryErrorState
						onRetry={() => onRetry?.()}
						isRetrying={isRetrying}
						title="Couldn't load updates"
					/>
				</View>
			) : isPending && rows.length === 0 ? (
				<View className="mx-4 py-8 items-center">
					<ActivityIndicator color={Colors.gray[400]} />
				</View>
			) : showEmpty ? (
				<View className="mx-4 py-6 items-center bg-white rounded-2xl border border-border">
					<Text className="text-gray-500 text-sm">
						Nothing scheduled for you right now.
					</Text>
				</View>
			) : (
				<View className="mx-4 bg-white rounded-2xl border border-border overflow-hidden">
					{rows.map((row, index) => {
						const isLast = index === rows.length - 1;
						const divider = !isLast ? "border-b border-border" : "";

						if (row.kind === "cell" && nextMeeting) {
							const badge = formatCompactDateBadge(
								nextMeeting.nextDate,
							);
							return (
								<Pressable
									key="cell-meeting"
									onPress={() => router.push("/(app)/cells")}
									className={`flex-row items-center px-4 py-4 gap-3 active:opacity-80 ${divider}`}
								>
									<View className="w-12 items-center">
										<Text className="text-xs font-bold text-primary-500">
											{badge.day}
										</Text>
										<Text className="text-[10px] font-semibold text-primary-500">
											{badge.month}
										</Text>
									</View>
									<View className="flex-1">
										<Text className="text-base font-medium text-black">
											Cell meeting this{" "}
											{nextMeeting.cell.meeting_day}
										</Text>
										<Text
											className="text-sm text-gray-500 mt-0.5"
											numberOfLines={1}
										>
											{nextMeeting.cell.cell_name} ·{" "}
											{nextMeeting.displayTime}
										</Text>
									</View>
									<ChevronRightIcon size={18} color="#8E8E93" />
								</Pressable>
							);
						}

						if (row.kind === "followUp") {
							const subtitle =
								assignmentStats.newToday > 0
									? `${assignmentStats.newToday} new assignments today`
									: "View your assignments";
							return (
								<Pressable
									key="follow-up"
									onPress={() =>
										router.push("/(app)/flows?assignmentFilter=me")
									}
									className={`flex-row items-center px-4 py-4 gap-3 active:opacity-80 ${divider}`}
								>
									<View
										className="w-10 h-10 rounded-full items-center justify-center"
										style={{
											backgroundColor: Colors.gray[100],
										}}
									>
										<FunnelIcon
											size={18}
											color={Colors.gray[600]}
											strokeWidth={1}
										/>
									</View>
									<View className="flex-1">
										<Text className="text-base font-medium text-black">
											{assignmentStats.total} people need
											follow-up
										</Text>
										<Text className="text-sm text-gray-500 mt-0.5">
											{subtitle}
										</Text>
									</View>
									<View className="min-w-[28px] h-7 px-2 rounded-full bg-primary-500 items-center justify-center">
										<Text className="text-white text-xs font-bold">
											{assignmentStats.total}
										</Text>
									</View>
								</Pressable>
							);
						}

						const { notification } = row;
						return (
							<Pressable
								key={`notification-${notification.id}`}
								onPress={() =>
									navigateNotification(router, notification)
								}
								className={`flex-row items-center px-4 py-4 gap-3 active:opacity-80 ${divider}`}
							>
								<View
									className="w-10 h-10 rounded-full items-center justify-center"
									style={{
										backgroundColor: Colors.gray[100],
									}}
								>
									<CalendarDays
										size={18}
										color={Colors.gray[600]}
										strokeWidth={1}
									/>
								</View>
								<View className="flex-1">
									<Text
										className="text-base font-medium text-black"
										numberOfLines={1}
									>
										{notification.title}
									</Text>
									<Text
										className="text-sm text-gray-500 mt-0.5"
										numberOfLines={1}
									>
										{notification.body}
									</Text>
								</View>
								<ChevronRightIcon size={18} color="#8E8E93" />
							</Pressable>
						);
					})}
				</View>
			)}
		</View>
	);
};

export default ForYouSection;
