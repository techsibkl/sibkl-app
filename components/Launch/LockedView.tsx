import { RefreshCw } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { CountdownDisplay } from "./CountdownDisplay";
import { LockedFeatureCard } from "./FeatureCards";
import { UNLOCK_FEATURES } from "./featureData";

type Props = {
	/** "locked" or "refreshing" — drives button state */
	screenState: "locked" | "refreshing";
	isCountdownActive: boolean;
	msLeft: number;
	countdownJustExpired: boolean;
	/** BE status is already "unlocked" but user hasn't tapped yet */
	beAlreadyUnlocked: boolean;
	errorMsg: string | null;
	refreshDisabled: boolean;
	onRefresh: () => void;
};

export const LockedView = ({
	screenState,
	isCountdownActive,
	msLeft,
	countdownJustExpired,
	beAlreadyUnlocked,
	errorMsg,
	refreshDisabled,
	onRefresh,
}: Props) => (
	<View>
		{/* Error banner */}
		{errorMsg && (
			<View className="mx-6 mb-4 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-100">
				<Text className="text-amber-700 text-sm text-center font-regular">
					{errorMsg}
				</Text>
			</View>
		)}

		{/* BE already unlocked — prompt user to activate */}
		{beAlreadyUnlocked && !errorMsg && (
			<View className="mx-6 mb-5 px-4 py-3 bg-green-50 rounded-2xl border border-green-100">
				<Text className="text-green-700 text-sm text-center font-semibold">
					🎉 Features are ready! Tap below to activate.
				</Text>
			</View>
		)}

		{/* Countdown boxes */}
		{isCountdownActive && <CountdownDisplay msLeft={msLeft} />}

		{/* Post-countdown hint (countdown expired, BE still locked) */}
		{countdownJustExpired && !errorMsg && (
			<Text className="text-center text-green-600 text-sm font-semibold mb-5">
				🎉 The time has come — tap below to unlock!
			</Text>
		)}

		{/* Refresh button */}
		<View className="px-6">
			<TouchableOpacity
				onPress={onRefresh}
				disabled={refreshDisabled}
				activeOpacity={refreshDisabled ? 1 : 0.8}
				className={`py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
					refreshDisabled ? "bg-gray-100" : "bg-blue-500"
				}`}
			>
				{screenState === "refreshing" ? (
					<>
						<RefreshCw
							size={18}
							color="#9CA3AF"
							strokeWidth={1.5}
						/>
						<Text className="text-gray-400 font-semibold text-base ml-2">
							Checking…
						</Text>
					</>
				) : (
					<>
						<RefreshCw
							size={18}
							color={refreshDisabled ? "#D1D5DB" : "#ffffff"}
							strokeWidth={1.5}
						/>
						<Text
							className={`font-bold text-base ml-2 ${
								refreshDisabled ? "text-gray-400" : "text-white"
							}`}
						>
							Refresh to Unlock
						</Text>
					</>
				)}
			</TouchableOpacity>

			<Text className="text-center text-xs text-gray-400 mt-3 font-regular">
				{beAlreadyUnlocked
					? "Tap above to activate your full experience."
					: isCountdownActive
						? "The unlock button will activate when the event begins."
						: "Already at the event? Tap above when the launch begins."}
			</Text>
		</View>

		{/* Sneak-peek section */}
		<View className="flex-row items-center gap-3 px-6 my-6">
			<View className="h-px flex-1 bg-gray-100" />
			<Text className="text-xs font-bold text-gray-400 tracking-widest uppercase">
				Coming soon
			</Text>
			<View className="h-px flex-1 bg-gray-100" />
		</View>

		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			style={{ height: 148 }}
			contentContainerStyle={{
				paddingHorizontal: 24,
				gap: 10,
				alignItems: "center",
			}}
		>
			{UNLOCK_FEATURES.map(({ key, ...cardProps }) => (
				<LockedFeatureCard key={key} {...cardProps} />
			))}
		</ScrollView>
	</View>
);
