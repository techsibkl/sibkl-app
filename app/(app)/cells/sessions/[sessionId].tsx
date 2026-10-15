import SharedBody from "@/components/shared/SharedBody";
import {
	useCloseCellSessionMutation,
	useToggleMemberCheckInMutation,
} from "@/hooks/CellAttendance/useCellAttendanceMutation";
import { useCellSessionByIdQuery } from "@/hooks/CellAttendance/useCellAttendanceQuery";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import {
	CellSessionAttendee,
	CellSessionMember,
} from "@/services/CellAttendance/cellAttendance.type";
import { useAuthStore } from "@/stores/authStore";
import { cellAttendanceErrorMessage } from "@/utils/cellMembership";
import * as FileSystem from "expo-file-system";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { CheckIcon, UserIcon } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

// ─── Session member row ─────────────────────────────────────────────────────
type SessionMemberRowProps = {
	member: CellSessionMember;
	checkedIn: boolean;
	checkedInAt?: string;
	canCheckIn: boolean;
	isProcessing: boolean;
	onPress: () => void;
	isReadOnly?: boolean;
};

const SessionMemberRow = ({
	member,
	checkedIn,
	checkedInAt,
	canCheckIn,
	isProcessing,
	onPress,
	isReadOnly = false,
}: SessionMemberRowProps) => {
	const initials = (member.full_legal_name ?? "?")
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0]?.toUpperCase() ?? "")
		.join("");

	const time = checkedInAt
		? new Date(checkedInAt).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			})
		: null;

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.6}
			disabled={isProcessing || isReadOnly}
		>
			<View
				className={`flex-row items-center gap-x-3 px-4 py-4 border-b border-border-secondary ${
					isReadOnly && !checkedIn ? "opacity-60" : ""
				}`}
			>
				{/* Avatar */}
				<View
					className="w-11 h-11 rounded-full items-center justify-center"
					style={{
						backgroundColor: checkedIn ? "#dcfce7" : "#f3f4f6",
					}}
				>
					<Text
						className="text-sm font-bold"
						style={{
							color: checkedIn ? "#16a34a" : "#9ca3af",
						}}
					>
						{initials}
					</Text>
				</View>

				{/* Info */}
				<View className="flex-1 gap-y-0.5">
					<View className="flex-row items-center gap-2">
						<Text
							className="text-text font-semibold flex-1"
							numberOfLines={1}
						>
							{member.full_legal_name}
						</Text>
					</View>
					<Text
						className="text-text-secondary text-sm"
						numberOfLines={1}
					>
						{checkedIn && time
							? `Checked in at ${time}`
							: (member.phone ?? "-")}
					</Text>
				</View>

				{/* Status indicator */}
				{isProcessing ? (
					<ActivityIndicator size="small" color="blue" />
				) : checkedIn ? (
					<View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
						<CheckIcon
							size={16}
							color="#16a34a"
							strokeWidth={2.5}
						/>
					</View>
				) : canCheckIn ? (
					<View className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 items-center justify-center">
						<UserIcon size={14} color="#d1d5db" />
					</View>
				) : (
					<View className="w-8 h-8 items-center justify-center">
						<Text className="text-xs text-gray-400">–</Text>
					</View>
				)}
			</View>
		</TouchableOpacity>
	);
};

// ─── Main screen ────────────────────────────────────────────────────────────

export default function SessionDetailScreen() {
	const { cellId, sessionId } = useLocalSearchParams<{
		cellId: string;
		sessionId: string;
	}>();
	const numericCellId = Number(cellId);
	const numericSessionId = Number(sessionId);
	const { ability, user } = useAuthStore();
	const { data: person } = useSinglePersonQuery(user?.person?.id ?? -1);

	const qrRef = useRef<any>(null);
	const [sharing, setSharing] = useState(false);
	const [checkingInId, setCheckingInId] = useState<number | null>(null);
	const [notification, setNotification] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const {
		data: session,
		isLoading,
		isError,
		refetch,
	} = useCellSessionByIdQuery(numericCellId, numericSessionId);

	const { mutateAsync: toggleCheckIn } = useToggleMemberCheckInMutation(
		numericCellId,
		numericSessionId,
	);
	const { mutateAsync: closeSession, isPending: isClosing } =
		useCloseCellSessionMutation(numericCellId, numericSessionId);

	useFocusEffect(
		useCallback(() => {
			if (!numericCellId || !numericSessionId) return;
			refetch();
		}, [numericCellId, numericSessionId, refetch]),
	);

	// ── Derived state ──────────────────────────────────────────────────────────

	const isClosed = session?.status === "closed";
	const date = session ? new Date(session.meeting_date) : new Date();
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const isToday = date.toDateString() === new Date().toDateString();
	const meetingDay = new Date(date);
	meetingDay.setHours(0, 0, 0, 0);
	const isFuture = meetingDay.getTime() > today.getTime();
	const isUpcoming = isFuture;
	const isLive = Boolean(session) && !isClosed && isToday;
	const canCheckIn = !isClosed && !isFuture;
	const membershipPerson = person ?? user?.person;
	const isLeaderOrCoreOfCell = [
		...(membershipPerson?.leader_of_cell_ids ?? []),
		...(membershipPerson?.core_of_cell_ids ?? []),
	]
		.map(Number)
		.includes(numericCellId);
	const canCloseSession =
		!isClosed &&
		(ability.can("manage", "all") || isLeaderOrCoreOfCell);

	const attendanceRate =
		session && session.total_members > 0
			? Math.round((session.attendee_count / session.total_members) * 100)
			: 0;

	// Map people_id → attendee record for quick lookup
	const attendeeMap = useMemo<Map<number, CellSessionAttendee>>(() => {
		const map = new Map<number, CellSessionAttendee>();
		for (const a of session?.attendees ?? []) {
			if (a.people_id != null) map.set(a.people_id, a);
		}
		return map;
	}, [session?.attendees]);

	const sortedMembers = useMemo<CellSessionMember[]>(() => {
		const members = session?.members ?? [];
		return [...members].sort((a, b) => {
			const aIn = attendeeMap.has(a.id) ? 1 : 0;
			const bIn = attendeeMap.has(b.id) ? 1 : 0;
			if (aIn !== bIn) return aIn - bIn;
			return (a.full_legal_name ?? "").localeCompare(
				b.full_legal_name ?? "",
			);
		});
	}, [session?.members, attendeeMap]);

	const guestAttendees = useMemo(
		() =>
			(session?.attendees ?? []).filter(
				(attendee) => attendee.people_id == null,
			),
		[session?.attendees],
	);

	// ── Actions ────────────────────────────────────────────────────────────────

	const handleShareQR = async () => {
		if (!qrRef.current) return;
		setSharing(true);
		try {
			qrRef.current.toDataURL(async (dataUrl: string) => {
				const path = `${FileSystem.cacheDirectory}session-${sessionId}-qr.png`;
				await FileSystem.writeAsStringAsync(path, dataUrl, {
					encoding: FileSystem.EncodingType.Base64,
				});
				await Sharing.shareAsync(path, {
					mimeType: "image/png",
					dialogTitle: "Share Session QR Code",
				});
				setSharing(false);
			});
		} catch {
			setSharing(false);
		}
	};

	const showNotice = (type: "success" | "error", message: string) => {
		setNotification({ type, message });
		setTimeout(() => setNotification(null), 3000);
	};

	const handleMemberCheckIn = async (member: CellSessionMember) => {
		if (!session || !canCheckIn) return;

		const isCheckedIn = attendeeMap.has(member.id);
		setCheckingInId(member.id);
		setNotification(null);

		const action = isCheckedIn ? "checkout" : "checkin";
		try {
			await toggleCheckIn({
				attendanceId: String(session.id),
				peopleId: member.id,
				checkedIn: isCheckedIn,
			});

			showNotice(
				"success",
				`${member.full_legal_name} ${action === "checkin" ? "checked in" : "checked out"}`,
			);
		} catch (err: any) {
			if (err?.err_code === "SESSION_CLOSED") refetch();
			showNotice(
				"error",
				cellAttendanceErrorMessage(
					err,
					`Failed to ${action} ${member.full_legal_name}`,
					member.full_legal_name,
				),
			);
		} finally {
			setCheckingInId(null);
		}
	};

	const handleCloseSession = () => {
		Alert.alert(
			"Close session",
			"This freezes today's attendance. People added after closing will not be included.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Close session",
					style: "destructive",
					onPress: async () => {
						try {
							await closeSession();
							showNotice("success", "Session closed.");
						} catch (err: any) {
							showNotice(
								"error",
								err?.message ?? "Failed to close session.",
							);
						}
					},
				},
			],
		);
	};

	// ── Loading / error guards ─────────────────────────────────────────────────

	if (isLoading) {
		return (
			<SharedBody>
				<ActivityIndicator color="#d6361e" size="large" />
			</SharedBody>
		);
	}

	if (isError || !session) {
		return (
			<SharedBody>
				<Text className="text-red-600 text-base">
					Failed to load session.
				</Text>
			</SharedBody>
		);
	}

	// ── Render ─────────────────────────────────────────────────────────────────

	return (
		<SharedBody>
			<View className="flex-1">
				<ScrollView
					contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
					showsVerticalScrollIndicator={false}
				>
					{/* Header */}
					<View className="mb-6">
						<View className="flex-row items-center gap-2 mb-3">
							<View className="w-9 h-1 bg-red-600 rounded-full" />
							{isLive && (
								<View className="bg-red-600 rounded-full px-2 py-0.5">
									<Text className="text-white text-xs font-bold tracking-wide">
										LIVE
									</Text>
								</View>
							)}
							{isClosed && (
								<View className="bg-gray-200 rounded-full px-2 py-0.5">
									<Text className="text-gray-700 text-xs font-bold tracking-wide">
										CLOSED
									</Text>
								</View>
							)}
						</View>
						<Text className="text-2xl font-bold text-gray-900 tracking-tight leading-8">
							{date.toLocaleDateString("default", {
								weekday: "long",
								month: "long",
								day: "numeric",
								year: "numeric",
							})}
						</Text>
						<Text className="text-sm text-gray-400 mt-1">
							{isClosed
								? `Closed · ${attendanceRate}% attendance`
								: isLive
									? "Session is live"
									: isUpcoming
										? "Upcoming"
										: `${attendanceRate}% attendance rate`}
						</Text>
					</View>

					{/* Stats */}
					{(isClosed || !isUpcoming || isLive) && (
						<View className="flex-row bg-gray-50 rounded-2xl p-4 mb-7 border border-gray-100">
							<View className="flex-1 items-center">
								<Text className="text-2xl font-bold text-gray-900">
									{session.attendee_count}
								</Text>
								<Text className="text-xs text-gray-400 mt-0.5 font-medium">
									Attended
								</Text>
							</View>
							<View className="w-px bg-gray-200" />
							<View className="flex-1 items-center">
								<Text className="text-2xl font-bold text-gray-900">
									{session.total_members}
								</Text>
								<Text className="text-xs text-gray-400 mt-0.5 font-medium">
									Members
								</Text>
							</View>
							<View className="w-px bg-gray-200" />
							<View className="flex-1 items-center">
								<Text className="text-2xl font-bold text-red-600">
									{attendanceRate}%
								</Text>
								<Text className="text-xs text-gray-400 mt-0.5 font-medium">
									Rate
								</Text>
							</View>
						</View>
					)}

					{/* QR Section */}
					<View className="mb-8">
						<Text className="text-xs font-bold text-gray-400 tracking-widest mb-1">
							SESSION QR CODE
						</Text>
						<Text className="text-sm text-gray-300 mb-5">
							{isClosed
								? "Session is closed — attendance is frozen"
								: isLive
									? "Session is live — share QR for members to scan"
									: "Members scan this to mark attendance"}
						</Text>

						<View className="items-center">
							<View
								className={`p-6 bg-white rounded-3xl mb-5 ${isClosed ? "opacity-40" : ""}`}
								style={{
									shadowColor: "#000",
									shadowOffset: { width: 0, height: 4 },
									shadowOpacity: 0.08,
									shadowRadius: 16,
									elevation: 5,
								}}
							>
								<QRCode
									value={String(session.id)}
									size={200}
									getRef={(ref) => (qrRef.current = ref)}
									color={isClosed ? "#cccccc" : "#111111"}
								/>
								{isClosed && (
									<View className="absolute inset-0 items-center justify-center rounded-3xl">
										<View className="bg-white/90 px-3 py-1 rounded-lg">
											<Text className="text-gray-400 font-black tracking-widest text-sm">
												CLOSED
											</Text>
										</View>
									</View>
								)}
							</View>

							{/* Action buttons */}
							<View className="flex-row gap-3 w-full">
								<Pressable
									className={`flex-1 bg-red-600 rounded-xl py-3.5 items-center ${
										isClosed || sharing ? "opacity-40" : ""
									}`}
									onPress={handleShareQR}
									disabled={sharing || isClosed}
								>
									{sharing ? (
										<ActivityIndicator
											color="#fff"
											size="small"
										/>
									) : (
										<Text className="text-white font-bold text-base">
											Share QR
										</Text>
									)}
								</Pressable>

								<Pressable
									className={`flex-1 border-2 border-red-600 rounded-xl py-3.5 items-center ${
										isClosed ? "opacity-40" : ""
									}`}
									onPress={handleShareQR}
									disabled={sharing || isClosed}
								>
									<Text className="text-red-600 font-bold text-base">
										Download PNG
									</Text>
								</Pressable>
							</View>

							{canCloseSession && (
								<Pressable
									className={`mt-3 w-full border-2 border-gray-900 rounded-xl py-3.5 items-center ${
										isClosing ? "opacity-40" : ""
									}`}
									onPress={handleCloseSession}
									disabled={isClosing}
								>
									{isClosing ? (
										<ActivityIndicator
											color="#111"
											size="small"
										/>
									) : (
										<Text className="text-gray-900 font-bold text-base">
											Close session
										</Text>
									)}
								</Pressable>
							)}
						</View>
					</View>

					{/* ── Members check-in list ────────────────────────────────────── */}
					<View>
						<View className="flex-row items-center justify-between mb-1">
							<Text className="text-xs font-bold text-gray-400 tracking-widest">
								MEMBERS ({session.total_members})
							</Text>
							<Text className="text-xs text-gray-400">
								{attendeeMap.size} checked in
							</Text>
						</View>

						<Text className="text-xs text-gray-400 mb-4">
							{canCheckIn
								? "Tap a member to check them in or out"
								: isFuture
									? "Check-in opens on the meeting day"
									: "Attendance is frozen for this session"}
						</Text>

						{sortedMembers.length === 0 ? (
							<Text className="text-gray-400 text-sm text-center py-6">
								No members found.
							</Text>
						) : (
							<View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
								{sortedMembers.map((member) => {
									const attendee = attendeeMap.get(member.id);
									return (
										<SessionMemberRow
											key={member.id}
											member={member}
											checkedIn={attendeeMap.has(
												member.id,
											)}
											checkedInAt={
												attendee?.checked_in_at
											}
											canCheckIn={canCheckIn}
											isProcessing={
												checkingInId === member.id
											}
											onPress={() =>
												canCheckIn &&
												handleMemberCheckIn(member)
											}
											isReadOnly={!canCheckIn}
										/>
									);
								})}
							</View>
						)}

						{guestAttendees.length > 0 && (
							<View className="mt-4">
								<Text className="text-xs font-bold text-gray-400 tracking-widest mb-2">
									GUESTS ({guestAttendees.length})
								</Text>
								<View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
									{guestAttendees.map((guest) => (
										<View
											key={guest.id}
											className="px-4 py-3 border-b border-border-secondary"
										>
											<Text className="text-text font-semibold">
												{guest.guest_name || "Guest"}
											</Text>
											<Text className="text-text-secondary text-sm">
												{guest.guest_phone ||
													"Checked in"}
											</Text>
										</View>
									))}
								</View>
							</View>
						)}
					</View>
				</ScrollView>

				{/* ── Toast notification ─────────────────────────────────── */}
				{notification && (
					<View
						className={`absolute bottom-6 left-4 right-4 rounded-xl px-4 py-3 flex-row items-center gap-3 ${
							notification.type === "success"
								? "bg-green-200"
								: "bg-red-200"
						}`}
						style={{ elevation: 20 }}
					>
						<Text
							className={`flex-1 font-medium ${notification.type === "success" ? "text-green-800" : "text-red-800"}`}
						>
							{notification.message}
						</Text>
					</View>
				)}
			</View>
		</SharedBody>
	);
}
