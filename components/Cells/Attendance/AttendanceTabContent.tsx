import AnalyticsPanel from "@/components/Cells/Analytics/AnalyticsPanel";
import ConsistentPicker from "@/components/DatePickers/ConsistentPicker";
import { CellSession } from "@/services/CellAttendance/cellAttendance.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
	endOfMonth,
	format,
	isAfter,
	isBefore,
	startOfMonth,
	startOfYear,
	subDays,
	subMonths,
} from "date-fns";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import AttendanceSessionsList from "./AttendanceSessionsList";
import MyAttendanceSummary from "./MyAttendanceSummary";

type ShortcutKey =
	| "all"
	| "lastMonth"
	| "currentMonth"
	| "last90Days"
	| "yearToDate";

const SHORTCUTS: { key: ShortcutKey; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "lastMonth", label: "Last Month" },
	{ key: "currentMonth", label: "Current Month" },
	{ key: "last90Days", label: "Last 90 Days" },
	{ key: "yearToDate", label: "Year To Date" },
];

function getShortcutRange(key: ShortcutKey): {
	start: Date | null;
	end: Date | null;
} {
	const now = new Date();
	switch (key) {
		case "all":
			return { start: null, end: null };
		case "lastMonth": {
			const lastMonth = subMonths(now, 1);
			return {
				start: startOfMonth(lastMonth),
				end: endOfMonth(lastMonth),
			};
		}
		case "currentMonth":
			return { start: startOfMonth(now), end: now };
		case "last90Days":
			return { start: subDays(now, 90), end: now };
		case "yearToDate":
			return { start: startOfYear(now), end: now };
	}
}

export type Props = {
	cellId: number;
	sessions: CellSession[];
	isLeader: boolean;
	currentPersonId?: number;
	sessionStats?: any;
	memberStats?: any;
	mySessionAttendance?: Record<number, boolean>;
	members?: any[];
	isLoadingSessions?: boolean;
	isLoadingPersonStats?: boolean;
};

export default function AttendanceTabContent({
	cellId,
	sessions,
	isLeader,
	currentPersonId,
	sessionStats,
	memberStats,
	mySessionAttendance = {},
	members = [],
	isLoadingSessions = false,
	isLoadingPersonStats = false,
}: Props) {
	const [cellAttendanceExpanded, setCellAttendanceExpanded] =
		useState(isLeader);
	const [myAttendanceExpanded, setMyAttendanceExpanded] = useState(true);

	// Date range filter state
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [activeShortcut, setActiveShortcut] = useState<ShortcutKey>("all");
	const [showStartPicker, setShowStartPicker] = useState(false);
	const [showEndPicker, setShowEndPicker] = useState(false);

	const applyShortcut = (key: ShortcutKey) => {
		const { start, end } = getShortcutRange(key);
		setStartDate(start);
		setEndDate(end);
		setActiveShortcut(key);
	};

	const clearDates = () => {
		setStartDate(null);
		setEndDate(null);
		setActiveShortcut("all");
	};

	// Filter sessions by date range
	const filteredSessions = useMemo(() => {
		if (!startDate && !endDate) return sessions;
		return sessions.filter((session) => {
			const d = new Date(session.meeting_date);
			if (startDate && isBefore(d, startDate)) return false;
			if (endDate && isAfter(d, endDate)) return false;
			return true;
		});
	}, [sessions, startDate, endDate]);

	// Recompute my stats from filtered sessions + attendance map
	const myStats = useMemo(() => {
		const totalSessions = filteredSessions.length;
		if (totalSessions === 0) return null;
		const sessionsAttended = filteredSessions.filter(
			(s) => mySessionAttendance[s.id],
		).length;
		const attendanceRate =
			totalSessions > 0 ? sessionsAttended / totalSessions : 0;
		return {
			sessions_attended: sessionsAttended,
			total_sessions: totalSessions,
			attendance_rate: attendanceRate,
		};
	}, [filteredSessions, mySessionAttendance]);

	const hasActiveDateFilter = !!(startDate || endDate);

	return (
		<View className="flex-1">
			{/* Sticky Date Range Filter */}
			<View className="px-4 pt-4 pb-3 bg-background border-b border-gray-100">
				<View className="bg-gray-50 rounded-xl p-3 border border-gray-100">
					{/* Date inputs row */}
					<View className="flex-row gap-2 mb-3">
						<TouchableOpacity
							onPress={() => setShowStartPicker(true)}
							className="flex-1 flex-row items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5"
						>
							<MaterialCommunityIcons
								name="calendar-range"
								size={15}
								color="#6B7280"
							/>
							<Text
								className={`text-sm flex-1 ${startDate ? "text-gray-800 font-medium" : "text-gray-400"}`}
							>
								{startDate
									? format(startDate, "dd/MM/yyyy")
									: "Start Date"}
							</Text>
						</TouchableOpacity>

						<View className="justify-center">
							<Text className="text-gray-400 text-xs">→</Text>
						</View>

						<TouchableOpacity
							onPress={() => setShowEndPicker(true)}
							className="flex-1 flex-row items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5"
						>
							<MaterialCommunityIcons
								name="calendar-range"
								size={15}
								color="#6B7280"
							/>
							<Text
								className={`text-sm flex-1 ${endDate ? "text-gray-800 font-medium" : "text-gray-400"}`}
							>
								{endDate
									? format(endDate, "dd/MM/yyyy")
									: "End Date"}
							</Text>
						</TouchableOpacity>

						{hasActiveDateFilter && activeShortcut === "all" && (
							<TouchableOpacity
								onPress={clearDates}
								className="bg-white border border-gray-200 rounded-lg px-2.5 items-center justify-center"
							>
								<MaterialCommunityIcons
									name="close"
									size={17}
									color="#9CA3AF"
								/>
							</TouchableOpacity>
						)}
					</View>

					{/* Shortcut pills */}
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 6 }}
					>
						{SHORTCUTS.map((shortcut) => {
							const isActive = activeShortcut === shortcut.key;
							return (
								<TouchableOpacity
									key={shortcut.key}
									onPress={() => applyShortcut(shortcut.key)}
									className={`px-3 py-1.5 rounded-full border ${
										isActive
											? "bg-gray-900 border-gray-900"
											: "bg-white border-gray-200"
									}`}
								>
									<Text
										className={`text-xs font-medium ${
											isActive
												? "text-white"
												: "text-gray-600"
										}`}
									>
										{shortcut.label}
									</Text>
								</TouchableOpacity>
							);
						})}
					</ScrollView>

					{/* Active filter summary */}
					{hasActiveDateFilter && (
						<Text className="text-xs text-gray-400 mt-2">
							Showing {filteredSessions.length} of{" "}
							{sessions.length} session
							{sessions.length !== 1 ? "s" : ""}
						</Text>
					)}
				</View>
			</View>

			{/* Date Pickers */}
			<ConsistentPicker
				date={startDate}
				open={showStartPicker}
				onConfirm={(d) => {
					setStartDate(d);
					setActiveShortcut("all");
					setShowStartPicker(false);
				}}
				onCancel={() => setShowStartPicker(false)}
			/>
			<ConsistentPicker
				date={endDate}
				open={showEndPicker}
				onConfirm={(d) => {
					setEndDate(d);
					setActiveShortcut("all");
					setShowEndPicker(false);
				}}
				onCancel={() => setShowEndPicker(false)}
			/>

			{/* Scrollable content */}
			<ScrollView
				showsVerticalScrollIndicator={false}
				className="px-4 py-4"
				contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
			>
				{/* Card 1 — My Attendance */}
				<View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
					<TouchableOpacity
						onPress={() =>
							setMyAttendanceExpanded(!myAttendanceExpanded)
						}
						activeOpacity={0.7}
						className="flex-row items-center px-5 py-4"
					>
						<View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center mr-3">
							<MaterialCommunityIcons
								name="account-check"
								size={20}
								color="#2563EB"
							/>
						</View>
						<View className="flex-1">
							<Text className="text-base font-bold text-gray-900">
								My Attendance
							</Text>
							{myStats && (
								<Text className="text-xs text-gray-400 mt-0.5">
									{myStats.sessions_attended}/
									{myStats.total_sessions} sessions ·{" "}
									{Math.round(
										myStats.attendance_rate * 100,
									)}
									%
								</Text>
							)}
						</View>
						<MaterialCommunityIcons
							name={
								myAttendanceExpanded
									? "chevron-up"
									: "chevron-down"
							}
							size={22}
							color="#9CA3AF"
						/>
					</TouchableOpacity>

					{myAttendanceExpanded && (
						<View className="border-t border-gray-100 px-5 pt-4 pb-5">
							{myStats && (
								<View className="mb-4">
									<MyAttendanceSummary
										sessionsAttended={
											myStats.sessions_attended ?? 0
										}
										totalSessions={
											myStats.total_sessions ?? 0
										}
										attendanceRate={
											myStats.attendance_rate ?? 0
										}
									/>
								</View>
							)}
							<Text className="text-sm font-semibold text-gray-700 mb-3">
								Session History
							</Text>
							<AttendanceSessionsList
								sessions={filteredSessions}
								myAttendanceMap={mySessionAttendance}
								isLoading={
									isLoadingSessions || isLoadingPersonStats
								}
							/>
						</View>
					)}
				</View>

				{/* Card 2 — Cell Analytics (leaders only) */}
				{isLeader && memberStats && (
					<View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
						<TouchableOpacity
							onPress={() =>
								setCellAttendanceExpanded(
									!cellAttendanceExpanded,
								)
							}
							activeOpacity={0.7}
							className="flex-row items-center px-5 py-4"
						>
							<View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center mr-3">
								<MaterialCommunityIcons
									name="chart-bar"
									size={20}
									color="#059669"
								/>
							</View>
							<View className="flex-1">
								<Text className="text-base font-bold text-gray-900">
									Cell Analytics
								</Text>
								<Text className="text-xs text-gray-400 mt-0.5">
									{filteredSessions.length} session
									{filteredSessions.length !== 1 ? "s" : ""}{" "}
									· {memberStats.length} member
									{memberStats.length !== 1 ? "s" : ""}
								</Text>
							</View>
							<MaterialCommunityIcons
								name={
									cellAttendanceExpanded
										? "chevron-up"
										: "chevron-down"
								}
								size={22}
								color="#9CA3AF"
							/>
						</TouchableOpacity>

						{cellAttendanceExpanded && (
							<View className="border-t border-gray-100 px-5 pt-4 pb-5">
								<AnalyticsPanel
									stats={memberStats}
									sessions={filteredSessions}
									members={members}
									cellId={cellId}
								/>
							</View>
						)}
					</View>
				)}
			</ScrollView>
		</View>
	);
}
