import SharedButton from "@/components/shared/SharedButton";
import { ScanQrCodeIcon, TicketIcon } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type EventDetailFooterMode =
	| "register"
	| "checkin"
	| "checked_in"
	| "checkin_unavailable"
	| "closed";

type EventDetailFooterProps = {
	mode: EventDetailFooterMode;
	onPress: () => void;
};

const footerConfig: Record<
	EventDetailFooterMode,
	{
		title: string;
		subtitle?: string;
		disabled: boolean;
		icon?: "qr" | "ticket";
	}
> = {
	register: {
		title: "Register for Event",
		subtitle: "Secure your spot today",
		disabled: false,
		icon: "ticket",
	},
	checkin: {
		title: "Scan QR to Check In",
		subtitle: "Open camera scanner at the venue",
		disabled: false,
		icon: "qr",
	},
	checked_in: {
		title: "Checked In",
		subtitle: "You're all set for this event",
		disabled: true,
	},
	checkin_unavailable: {
		title: "Check-in Unavailable",
		subtitle: "Check-in is not open yet",
		disabled: true,
	},
	closed: {
		title: "Registration Closed",
		disabled: true,
	},
};

const FooterIconButton = ({
	title,
	icon,
	onPress,
}: {
	title: string;
	icon: "qr" | "ticket";
	onPress: () => void;
}) => (
	<TouchableOpacity
		onPress={onPress}
		className={`px-4 py-3.5 rounded-xl flex-row items-center justify-center gap-2.5 ${
			icon === "qr" ? "bg-primary-500" : "bg-blue-500"
		}`}
		activeOpacity={0.7}
	>
		{icon === "qr" ? (
			<ScanQrCodeIcon size={20} color="#fff" />
		) : (
			<TicketIcon size={20} color="#fff" />
		)}
		<Text className="font-semibold text-white text-base">{title}</Text>
	</TouchableOpacity>
);

const EventDetailFooter = ({ mode, onPress }: EventDetailFooterProps) => {
	const insets = useSafeAreaInsets();
	const { title, subtitle, disabled, icon } = footerConfig[mode];

	return (
		<View
			className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-4 pt-3"
			style={{
				paddingBottom: Math.max(insets.bottom, 12),
				shadowColor: "#000",
				shadowOffset: { width: 0, height: -2 },
				shadowOpacity: 0.06,
				shadowRadius: 8,
				elevation: 8,
			}}
		>
			{subtitle ? (
				<Text
					className={`text-xs text-center mb-2 ${disabled ? "text-gray-300" : "text-gray-400"}`}
				>
					{subtitle}
				</Text>
			) : null}
			{icon && !disabled ? (
				<FooterIconButton title={title} icon={icon} onPress={onPress} />
			) : (
				<SharedButton title={title} onPress={onPress} disabled={disabled} />
			)}
		</View>
	);
};

export default EventDetailFooter;
