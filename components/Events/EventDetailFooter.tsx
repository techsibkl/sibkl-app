import SharedButton from "@/components/shared/SharedButton";
import React from "react";
import { View } from "react-native";
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
	{ title: string; disabled: boolean }
> = {
	register: { title: "Register", disabled: false },
	checkin: { title: "Check In", disabled: false },
	checked_in: { title: "Checked in", disabled: true },
	checkin_unavailable: { title: "Check-in unavailable", disabled: true },
	closed: { title: "Registration closed", disabled: true },
};

const EventDetailFooter = ({ mode, onPress }: EventDetailFooterProps) => {
	const insets = useSafeAreaInsets();
	const { title, disabled } = footerConfig[mode];

	return (
		<View
			className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-4 pt-3"
			style={{ paddingBottom: Math.max(insets.bottom, 12) }}
		>
			<SharedButton title={title} onPress={onPress} disabled={disabled} />
		</View>
	);
};

export default EventDetailFooter;
