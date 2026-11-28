import SharedBody from "@/components/shared/SharedBody";
import { useSuggestUnclaimedMutation } from "@/hooks/People/useSuggestUnclaimedMutation";
import { UnclaimedSuggestion } from "@/services/Person/person.type";
import { useClaimStore } from "@/stores/claimStore";
import { useSignUpStore } from "@/stores/signUpStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const Page = () => {
	const router = useRouter();
	const {
		claimToken,
		suggestions,
		setSelectedProfile,
		setVerificationChannel,
		setClaimSession,
		reset,
	} = useClaimStore();
	const { pendingSignUp, setPendingSignUp } = useSignUpStore();
	const suggestUnclaimed = useSuggestUnclaimedMutation();
	const [declined, setDeclined] = useState(false);

	const email = pendingSignUp?.email?.trim() ?? "";
	const matches = suggestions ?? [];
	const showingMatches = suggestions !== null && matches.length > 0 && !declined;
	const showCreateChoice =
		suggestions !== null && (matches.length === 0 || declined);
	const title = showingMatches ? "Is this you?" : suggestions === null
		? "Profile lookup"
		: "Create a new account?";
	const description =
		suggestions === null
			? "We verified your email, but the profile lookup did not finish."
			: showingMatches
				? `We found ${matches.length === 1 ? "a profile" : "profiles"} that use ${email}.`
				: matches.length > 0
					? `Create a new account with ${email}, or go back and claim one of the profiles.`
					: `No existing profile matched ${email}. You can create a new account with this address, or verify a different one.`;

	useEffect(() => {
		if (!claimToken || !email) {
			router.replace("/(auth)/sign-up");
		}
	}, [claimToken, email, router]);

	const handleRetry = async () => {
		if (!claimToken) return;
		try {
			const next = await suggestUnclaimed.mutateAsync(claimToken);
			setClaimSession(claimToken, next);
		} catch (err: any) {
			Alert.alert(
				"Error",
				err?.message || "Could not look up profiles. Please try again.",
			);
		}
	};

	const handleAccept = (item: UnclaimedSuggestion) => {
		Alert.alert(
			"Claim this profile?",
			`Continue as ${item.full_legal_name}?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Continue",
					onPress: () => {
						setSelectedProfile({
							id: item.id,
							full_legal_name: item.full_legal_name,
							email,
							phone: "",
						});
						setVerificationChannel("email");
						router.push(
							`/(auth)/claim-set-password?full_email=${encodeURIComponent(email)}&id=${item.id}`,
						);
					},
				},
			],
		);
	};

	const handleContinueWithEmail = () => {
		setSelectedProfile(null);
		router.push("/(auth)/new-account");
	};

	const handleUseDifferentEmail = () => {
		reset();
		setPendingSignUp(null);
		router.replace("/(auth)/sign-up");
	};

	if (!claimToken || !email) {
		return null;
	}

	return (
		<SharedBody>
			<KeyboardAwareScrollView
				className="flex-1 bg-background p-6"
				enableOnAndroid={true}
				extraScrollHeight={5}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<View className="gap-y-4">
					<Text className="text-2xl font-bold text-text">{title}</Text>
					<Text className="font-regular text-text-secondary">
						{description}
					</Text>

					{suggestions === null ? (
						<TouchableOpacity
							className="w-full py-4 rounded-[15px] items-center justify-center bg-primary-600"
							onPress={handleRetry}
							disabled={suggestUnclaimed.isPending}
							accessibilityRole="button"
						>
							{suggestUnclaimed.isPending ? (
								<ActivityIndicator color="white" />
							) : (
								<Text className="text-lg text-white font-bold">
									Try again
								</Text>
							)}
						</TouchableOpacity>
					) : null}

					{showingMatches
						? matches.map((item) => (
								<TouchableOpacity
									key={item.id}
									className="bg-card rounded-2xl p-4 border border-border"
									onPress={() => handleAccept(item)}
									accessibilityRole="button"
									accessibilityLabel={`Claim profile ${item.full_legal_name}`}
								>
									<Text className="font-semibold text-lg text-text">
										{item.full_legal_name}
									</Text>
								</TouchableOpacity>
							))
						: null}

					{showingMatches ? (
						<TouchableOpacity
							className="w-full py-4 rounded-[15px] items-center justify-center border border-border bg-card"
							onPress={() => setDeclined(true)}
							accessibilityRole="button"
						>
							<Text className="text-base text-text font-semibold">
								None of these
							</Text>
						</TouchableOpacity>
					) : null}

					{showCreateChoice ? (
						<View className="gap-y-3 mt-2">
							<TouchableOpacity
								className="w-full py-4 rounded-[15px] items-center justify-center bg-primary-600"
								onPress={handleContinueWithEmail}
								accessibilityRole="button"
							>
								<Text className="text-lg text-white font-bold">
									Continue with this email
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className="w-full py-4 rounded-[15px] items-center justify-center border border-border bg-card"
								onPress={handleUseDifferentEmail}
								accessibilityRole="button"
							>
								<Text className="text-base text-text font-semibold">
									Use a different email
								</Text>
							</TouchableOpacity>
							{matches.length > 0 ? (
								<TouchableOpacity
									onPress={() => setDeclined(false)}
									accessibilityRole="button"
								>
									<Text className="text-primary-600 font-semibold text-center">
										Back to suggestions
									</Text>
								</TouchableOpacity>
							) : null}
						</View>
					) : null}
				</View>
			</KeyboardAwareScrollView>
		</SharedBody>
	);
};

export default Page;
