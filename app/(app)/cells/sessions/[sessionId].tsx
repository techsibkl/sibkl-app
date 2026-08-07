import SharedBody from "@/components/shared/SharedBody";
import { useSingleCellQuery } from "@/hooks/Cell/useSingleCellQuery";
import { useToggleMemberCheckInMutation } from "@/hooks/CellAttendance/useCellAttendanceMutation";
import { useCellSessionByIdQuery } from "@/hooks/CellAttendance/useCellAttendanceQuery";
import {
	CellSessionAttendee,
	CellSessionStatus,
} from "@/services/CellAttendance/cellAttendance.type";
import { Person } from "@/services/Person/person.type";
import { useQueryClient } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { CheckIcon, UserIcon } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

// ─── Session member row ─────────────────────────────────────────────────────
type SessionMemberRowProps = {
	member: Person;
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

	const statusBadgeColor =
		{
			PENDING: "#fef3c7",
			REMOVED: "#fee2e2",
		}[member.status as string] || "transparent";

	const statusTextColor =
		{
			PENDING: "#92400e",
			REMOVED: "#991b1b",
		}[member.status as string] || "#9ca3af";

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.6}
			disabled={isProcessing || isReadOnly}
		>
			<View
				className={`flex-row items-center gap-x-3 px-4 py-4 border-b border-border-secondary ${
					isReadOnly ? "opacity-60" : ""
				}`}
			>
				{/* Avatar */}
				<View
					className="w-11 h-11 rounded-full items-center justify-center"
					style={{
						backgroundColor: isReadOnly
							? "#e5e7eb"
							: checkedIn
								? "#dcfce7"
								: "#f3f4f6",
					}}
				>
					<Text
						className="text-sm font-bold"
						style={{
							color: isReadOnly
								? "#9ca3af"
								: checkedIn
									? "#16a34a"
									: "#9ca3af",
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
						{isReadOnly && member.status && (
							<View
								className="px-2 py-1 rounded"
								style={{ backgroundColor: statusBadgeColor }}
							>
								<Text
									className="text-xs font-semibold"
									style={{ color: statusTextColor }}
								>
									{member.status}
								</Text>
							</View>
						)}
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
				{isReadOnly ? (
					<View className="w-8 h-8 items-center justify-center">
						<Text className="text-xs text-gray-400">–</Text>
					</View>
				) : isProcessing ? (
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
				) : null}
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
	const queryClient = useQueryClient();

	const qrRef = useRef<any>(null);
	const [sharing, setSharing] = useState(false);
	const [checkingInId, setCheckingInId] = useState<number | null>(null);
	const [notification, setNotification] = useState<{
		type: "success" | "error";
		message: string;
		undoMember?: Person;
	} | null>(null);

	const {
		data: session,
		isLoading,
		isError,
	} = useCellSessionByIdQuery(numericCellId, numericSessionId);

	const { data: cell } = useSingleCellQuery(numericCellId);

	const { mutateAsync: toggleCheckIn } = useToggleMemberCheckInMutation(
		numericCellId,
		numericSessionId,
	);

	// Invalidate cell query on mount to ensure fresh member data
	useEffect(() => {
		queryClient.invalidateQueries({
			queryKey: ["cells", numericCellId],
		});
	}, [numericCellId, queryClient]);

	// ── Derived state ──────────────────────────────────────────────────────────

	const isLive = session?.status === ("open" as CellSessionStatus);
	const date = session ? new Date(session.meeting_date) : new Date();
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const isUpcoming = date >= today;
	// Allow check-in for all session types
	const canCheckIn = true;

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

	// Sort members: active members first (not-checked-in first, then checked-in), then pending, then REMOVED
	const sortedMembers = useMemo<Person[]>(() => {
		const members = cell?.members ?? [];
		return [...members].sort((a, b) => {
			// Priority 1: Status (ACTIVE first, then PENDING, then REMOVED)
			const statusOrder = { ACTIVE: 0, PENDING: 1, REMOVED: 2 };
			const aStatus = a.status ?? "ACTIVE";
			const bStatus = b.status ?? "ACTIVE";
			const aStatusPriority =
				statusOrder[aStatus as keyof typeof statusOrder] ?? 0;
			const bStatusPriority =
				statusOrder[bStatus as keyof typeof statusOrder] ?? 0;

			if (aStatusPriority !== bStatusPriority) {
				return aStatusPriority - bStatusPriority;
			}

			// Priority 2: For active members, sort by check-in status (not-checked-in first)
			if (aStatus === "ACTIVE" || aStatus === null) {
				const aIn = attendeeMap.has(a.id) ? 1 : 0;
				const bIn = attendeeMap.has(b.id) ? 1 : 0;
				return aIn - bIn;
			}

			return 0;
		});
	}, [cell?.members, attendeeMap]);

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

	const handleMemberCheckIn = async (member: Person) => {
		if (!session) return;
		setCheckingInId(member.id);
		setNotification(null);

		const isCheckedIn = attendeeMap.has(member.id);
		const action = isCheckedIn ? "checkout" : "checkin";
		try {
			await toggleCheckIn({
				attendanceId: String(session.id),
				peopleId: member.id,
				checkedIn: isCheckedIn,
			});

			// API succeeded, show success notification
			setNotification({
				type: "success",
				message: `${member.full_legal_name} ${action === "checkin" ? "checked in" : "checked out"}`,
				undoMember: member,
			});
			setTimeout(() => setNotification(null), 3000);
		} catch (err: any) {
			setNotification({
				type: "error",
				message:
					err?.message ??
					`Failed to ${action} ${member.full_legal_name}`,
			});
			setTimeout(() => setNotification(null), 3000);
		} finally {
			setCheckingInId(null);
		}
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
							{isUpcoming && !isLive
								? "Upcoming"
								: isLive
									? "Session is live"
									: `${attendanceRate}% attendance rate`}
						</Text>
					</View>

					{/* Stats */}
					{!isUpcoming && (
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
							{isUpcoming && !isLive
								? "Members scan this to mark attendance"
								: isLive
									? "Session is live — share QR for members to scan"
									: "Session has passed — QR no longer active"}
						</Text>

						<View className="items-center">
							<View
								className={`p-6 bg-white rounded-3xl mb-5 ${!isLive && !isUpcoming ? "opacity-40" : ""}`}
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
									color={
										isLive || isUpcoming
											? "#111111"
											: "#cccccc"
									}
								/>
								{!isLive && !isUpcoming && (
									<View className="absolute inset-0 items-center justify-center rounded-3xl">
										<View className="bg-white/90 px-3 py-1 rounded-lg">
											<Text className="text-gray-400 font-black tracking-widest text-sm">
												EXPIRED
											</Text>
										</View>
									</View>
								)}
							</View>

							{/* Action buttons */}
							<View className="flex-row gap-3 w-full">
								<Pressable
									className={`flex-1 bg-red-600 rounded-xl py-3.5 items-center ${
										!isUpcoming || sharing
											? "opacity-40"
											: ""
									}`}
									onPress={handleShareQR}
									disabled={sharing || !isUpcoming}
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
									className="flex-1 border-2 border-red-600 rounded-xl py-3.5 items-center"
									onPress={handleShareQR}
									disabled={sharing}
								>
									<Text className="text-red-600 font-bold text-base">
										Download PNG
									</Text>
								</Pressable>
							</View>
						</View>
					</View>

					{/* ── Members check-in list ────────────────────────────────────── */}
					<View>
						<View className="flex-row items-center justify-between mb-1">
							<Text className="text-xs font-bold text-gray-400 tracking-widest">
								MEMBERS ({sortedMembers.length})
							</Text>
							<Text className="text-xs text-gray-400">
								{attendeeMap.size} checked in
							</Text>
						</View>

						{canCheckIn && (
							<Text className="text-xs text-gray-400 mb-4">
								Tap a member to manually check them in
							</Text>
						)}

						{sortedMembers.length === 0 ? (
							<Text className="text-gray-400 text-sm text-center py-6">
								No members found.
							</Text>
						) : (
							<View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
								{sortedMembers.map((member) => {
									const attendee = attendeeMap.get(member.id);
									const isReadOnly =
										member.status === "PENDING" ||
										member.status === "REMOVED";
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
												!isReadOnly &&
												handleMemberCheckIn(member)
											}
											isReadOnly={isReadOnly}
										/>
									);
								})}
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
