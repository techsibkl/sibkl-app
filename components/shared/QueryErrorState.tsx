import SharedButton from "@/components/shared/SharedButton";
import { CloudOff } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

type QueryErrorStateProps = {
	onRetry: () => void;
	title?: string;
	message?: string;
	isRetrying?: boolean;
	className?: string;
};

const QueryErrorState = ({
	onRetry,
	title = "Couldn't load this",
	message = "Check your connection and try again.",
	isRetrying = false,
	className = "",
}: QueryErrorStateProps) => {
	return (
		<View
			className={`flex-1 justify-center items-center py-16 px-8 ${className}`}
		>
			<CloudOff size={64} color="#9CA3AF" />
			<Text className="text-xl font-semibold text-text mt-5 mb-2 text-center">
				{title}
			</Text>
			<Text className="text-base text-gray-400 text-center leading-6 mb-6">
				{message}
			</Text>
			<SharedButton
				title="Try again"
				onPress={onRetry}
				isLoading={isRetrying}
				className="min-w-[160px]"
			/>
		</View>
	);
};

export default QueryErrorState;
