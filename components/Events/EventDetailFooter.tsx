import SharedButton from "@/components/shared/SharedButton";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type EventDetailFooterProps = {
	registerable: boolean;
	onRegister: () => void;
};

const EventDetailFooter = ({
	registerable,
	onRegister,
}: EventDetailFooterProps) => {
	const insets = useSafeAreaInsets();

	return (
		<View
			className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-4 pt-3"
			style={{ paddingBottom: Math.max(insets.bottom, 12) }}
		>
			<SharedButton
				title={registerable ? "Register" : "Registration closed"}
				onPress={onRegister}
				disabled={!registerable}
			/>
		</View>
	);
};

export default EventDetailFooter;
