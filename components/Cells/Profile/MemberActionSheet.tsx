import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useToggleCoreMemberMutation } from "@/hooks/CellAttendance/useCellAttendanceQuery";
import { Person } from "@/services/Person/person.type";
import { router } from "expo-router";
import {
	MessageCircle,
	Phone,
	StarIcon,
	Trash2,
	User,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
	Animated,
	Dimensions,
	GestureResponderEvent,
	Linking,
	Modal,
	PanResponder,
	PanResponderGestureState,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const ACCENT = "#d6361e";
const PEEK_HEIGHT = SCREEN_HEIGHT * 0.28;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.4;
const CLOSE_THRESHOLD = PEEK_HEIGHT * 0.5;
const SIDE_MARGIN = 10;
const BOTTOM_MARGIN = 16;
const DRAG_CAPTURE_SLOP = 6;

interface MemberActionSheetProps {
	visible: boolean;
	onClose: () => void;
	member: Person | null;
	cellId?: number;
	isLeader?: boolean;
	currentPersonId?: number;
	onRemove?: (memberId: number) => void;
	onCoreToggled?: () => void;
}

const MemberActionSheet: React.FC<MemberActionSheetProps> = ({
	visible,
	onClose,
	member,
	cellId,
	isLeader = false,
	currentPersonId,
	onRemove,
	onCoreToggled,
}) => {
	const heightAnim = useRef(new Animated.Value(0)).current;

	const currentHeightRef = useRef(0);
	const dragStartHeight = useRef(PEEK_HEIGHT);
	const isExpandedRef = useRef(false);

	const [isExpanded, setIsExpanded] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [showCoreConfirmDialog, setShowCoreConfirmDialog] = useState(false);
	const { mutateAsync: toggleCore, isPending: isToggling } =
		useToggleCoreMemberMutation(cellId ?? 0);

	useEffect(() => {
		const id = heightAnim.addListener(({ value }) => {
			currentHeightRef.current = value;
		});
		return () => heightAnim.removeListener(id);
	}, [heightAnim]);

	useEffect(() => {
		if (visible) {
			heightAnim.setValue(0);
			currentHeightRef.current = 0;
			dragStartHeight.current = PEEK_HEIGHT;
			isExpandedRef.current = false;
			setIsExpanded(false);
			requestAnimationFrame(() => snapTo(PEEK_HEIGHT));
		}
	}, [visible]);

	const markExpanded = (val: boolean) => {
		isExpandedRef.current = val;
		setIsExpanded(val);
	};

	const snapTo = (target: number) => {
		Animated.spring(heightAnim, {
			toValue: target,
			useNativeDriver: false,
			bounciness: 4,
			speed: 14,
		}).start(() => {
			dragStartHeight.current = target;
			currentHeightRef.current = target;
			markExpanded(target >= EXPANDED_HEIGHT * 0.95);
		});
	};

	const closeSheet = () => {
		Animated.timing(heightAnim, {
			toValue: 0,
			duration: 200,
			useNativeDriver: false,
		}).start(() => onClose());
	};

	const onDragMove = (
		_: GestureResponderEvent,
		gesture: PanResponderGestureState,
	) => {
		const newHeight = dragStartHeight.current - gesture.dy;
		const clamped = Math.max(
			CLOSE_THRESHOLD * 0.6,
			Math.min(EXPANDED_HEIGHT, newHeight),
		);
		heightAnim.setValue(clamped);
	};

	const onDragRelease = (
		_: GestureResponderEvent,
		gesture: PanResponderGestureState,
	) => {
		const released = dragStartHeight.current - gesture.dy;
		const midpoint = (PEEK_HEIGHT + EXPANDED_HEIGHT) / 2;

		if (released < CLOSE_THRESHOLD) {
			closeSheet();
		} else if (released > midpoint) {
			snapTo(EXPANDED_HEIGHT);
		} else {
			snapTo(PEEK_HEIGHT);
		}
	};

	const headerPanResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: (_, g) =>
				Math.abs(g.dy) > Math.abs(g.dx) &&
				Math.abs(g.dy) > DRAG_CAPTURE_SLOP,
			onPanResponderGrant: () => {
				dragStartHeight.current = currentHeightRef.current;
			},
			onPanResponderMove: onDragMove,
			onPanResponderRelease: onDragRelease,
			onPanResponderTerminate: onDragRelease,
		}),
	).current;

	if (!member) return null;

	const backdropOpacity = heightAnim.interpolate({
		inputRange: [0, PEEK_HEIGHT],
		outputRange: [0, 1],
		extrapolate: "clamp",
	});

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const handleCall = () => {
		if (member.phone) {
			Linking.openURL(`tel:${member.phone}`);
		}
	};

	const handleWhatsApp = () => {
		if (member.phone) {
			const phoneNumber = member.phone.replace(/\D/g, "");
			Linking.openURL(`https://wa.me/${phoneNumber}`);
		}
	};

	const handleRemove = async () => {
		onRemove?.(member.id);
		closeSheet();
	};

	const handleToggleCore = async () => {
		if (!cellId || !member) return;
		try {
			const newIsCore = !member.is_core;
			await toggleCore({
				memberIds: [member.id],
				isCore: newIsCore,
			});
			onCoreToggled?.();
			closeSheet();
		} catch (error) {
			console.error("Error toggling core status:", error);
		}
	};

	const handleConfirmToggleCore = () => {
		setShowCoreConfirmDialog(false);
		handleToggleCore();
	};

	const canRemoveMember =
		isLeader && currentPersonId != null && member.id !== currentPersonId;
	const canToggleCore =
		isLeader && currentPersonId != null && member.id !== currentPersonId;

	return (
		<Modal
			animationType="none"
			transparent
			visible={visible}
			onRequestClose={closeSheet}
		>
			<View className="flex-1 justify-end">
				<TouchableOpacity
					className="absolute inset-0"
					activeOpacity={1}
					onPress={closeSheet}
					style={{ zIndex: 1 }}
				>
					<Animated.View
						style={[
							{
								flex: 1,
								backgroundColor: "rgba(0,0,0,0.45)",
								opacity: backdropOpacity,
							},
						]}
					/>
				</TouchableOpacity>

				<Animated.View
					className="mx-[10px] mb-4 rounded-[28px] overflow-hidden shadow-lg"
					style={{
						height: heightAnim,
						backgroundColor: "#fff",
						shadowColor: "#000",
						shadowOffset: { width: 0, height: 4 },
						shadowOpacity: 0.2,
						shadowRadius: 16,
						elevation: 10,
						zIndex: 10,
					}}
				>
					{/* Header — draggable */}
					<View
						{...headerPanResponder.panHandlers}
						className="z-10 bg-white"
					>
						<View className="w-9 h-1 rounded bg-[#e0e0e3] self-center mt-2.5 mb-4" />

						{/* Avatar and Basic Info */}
						<View className="flex-row items-center px-4 pb-4 gap-3.5">
							<View
								className="w-16 h-16 rounded-full items-center justify-center"
								style={{ backgroundColor: ACCENT + "20" }}
							>
								<Text
									className="text-2xl font-bold"
									style={{ color: ACCENT }}
								>
									{getInitials(
										member.full_legal_name ||
											member.preferred_name ||
											"?",
									)}
								</Text>
							</View>

							<View className="flex-1">
								<Text
									className="text-[18px] font-bold mb-1 text-[#1c1c1e]"
									numberOfLines={1}
								>
									{member.full_legal_name}
								</Text>
								{member.phone && (
									<Text
										className="text-[13px] text-[#8e8e93]"
										numberOfLines={1}
									>
										{member.phone}
									</Text>
								)}
							</View>
						</View>

						{/* Action Buttons, 2+1+2 grid style */}
						<View className="flex-row items-stretch px-4 gap-2 pb-4">
							{/* Profile */}
							<TouchableOpacity
								className="flex-1 p-1 aspect-square items-center justify-center bg-[#f0f0f1] rounded-2xl"
								onPress={() => {
									closeSheet();
									router.push({
										pathname: "/(app)/profile/[id]",
										params: {
											id: member.id,
											backPath: `/(app)/cells/profile/${cellId}`,
										},
									});
								}}
							>
								<User size={22} strokeWidth={2} />
								<Text className="text-xs font-medium mt-1 text-text">
									Profile
								</Text>
							</TouchableOpacity>
							{/* Call */}
							<TouchableOpacity
								className="flex-1 p-1 aspect-square items-center justify-center bg-[#f0f0f1] rounded-2xl"
								onPress={handleCall}
							>
								<Phone size={22} strokeWidth={2} />
								<Text className="text-xs font-medium mt-1 text-text">
									Call
								</Text>
							</TouchableOpacity>
							{/* WhatsApp */}
							<TouchableOpacity
								className="flex-1 p-1 aspect-square items-center justify-center bg-[#f0f0f1] rounded-2xl"
								onPress={handleWhatsApp}
							>
								<MessageCircle size={22} strokeWidth={2} />
								<Text className="text-xs font-medium mt-1 text-text">
									Text
								</Text>
							</TouchableOpacity>
							{/* Core Toggle Button */}
							{canToggleCore && (
								<TouchableOpacity
									onPress={() =>
										setShowCoreConfirmDialog(true)
									}
									disabled={isToggling}
									activeOpacity={isToggling ? 1 : 0.6}
									className={
										"flex-1 p-1 aspect-square items-center justify-center rounded-2xl bg-amber-100 " +
										(isToggling ? " opacity-50" : "")
									}
								>
									<StarIcon
										size={25}
										color={"#d97706"}
										strokeWidth={2}
									/>
									<Text
										className={
											"text-xs font-semibold text-center mt-1 text-amber-700"
										}
									>
										{member?.is_core
											? "Remove\nCore"
											: "Make\nCore"}
									</Text>
								</TouchableOpacity>
							)}
							{/* Remove */}
							{canRemoveMember && (
								<TouchableOpacity
									className="flex-1 p-1 aspect-square items-center justify-center bg-[#fee2e2] rounded-2xl"
									onPress={() => setShowConfirmDialog(true)}
								>
									<Trash2
										size={22}
										color="#dc2626"
										strokeWidth={2}
									/>
									<Text className="text-xs text-[#dc2626] font-medium mt-1">
										Remove
									</Text>
								</TouchableOpacity>
							)}
						</View>
					</View>
				</Animated.View>
			</View>

			<ConfirmDialog
				visible={showConfirmDialog}
				onClose={() => setShowConfirmDialog(false)}
				title="Remove Member"
				description={`Are you sure you want to remove ${
					member.full_legal_name || member.preferred_name
				} from this cell?`}
				actionText="Remove"
				cancelText="Cancel"
				onConfirm={handleRemove}
				isDestructive
			/>

			<ConfirmDialog
				visible={showCoreConfirmDialog}
				onClose={() => setShowCoreConfirmDialog(false)}
				title={
					member?.is_core ? "Remove Core Status" : "Make Core Member"
				}
				description={
					member?.is_core
						? `Are you sure you want to remove ${
								member.full_legal_name || member.preferred_name
							} as a core member?`
						: `Are you sure you want to make ${
								member.full_legal_name || member.preferred_name
							} a core member?`
				}
				actionText={member?.is_core ? "Remove Core" : "Make Core"}
				cancelText="Cancel"
				onConfirm={handleConfirmToggleCore}
			/>
		</Modal>
	);
};

export default MemberActionSheet;
