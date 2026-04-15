import ProfileItem from "@/components/Auth/ProfileItem";
import PulsingLogo from "@/components/shared/PulsingLogo";
import { usePeopleWithNouidQuery } from "@/hooks/People/usePeopleWithNoUid";
import { useClaimStore } from "@/stores/claimStore";
import { FlashList } from "@shopify/flash-list";
import { Link, useRouter } from "expo-router";
import { User2Icon, XIcon } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
	ActivityIndicator,
	ImageSourcePropType,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SibklText from "../../assets/images/sibkl-text-white.png";

const PAGE_SIZE = 20;

const Page = () => {
	const router = useRouter();
	const claimStore = useClaimStore();
	const {
		isPending,
		isError,
		error,
		data: maskedPeople,
	} = usePeopleWithNouidQuery();
	const [nameQuery, setNameQuery] = useState("");
	const [page, setPage] = useState(1);
	const [loadingMore, setLoadingMore] = useState(false);

	const filteredProfiles = useMemo(() => {
		return nameQuery
			? (maskedPeople ?? []).filter((person) =>
					person?.full_legal_name
						?.toLowerCase()
						.includes(nameQuery.trim().toLowerCase()),
				)
			: [];
	}, [nameQuery, maskedPeople]);

	const visibleProfiles = useMemo(
		() => filteredProfiles.slice(0, page * PAGE_SIZE),
		[filteredProfiles, page],
	);

	const handleLoadMore = () => {
		if (page * PAGE_SIZE < filteredProfiles.length && !loadingMore) {
			setLoadingMore(true);
			setTimeout(() => {
				setPage((prev) => prev + 1);
				setLoadingMore(false);
			}, 300);
		}
	};

	const inputPadding =
		Platform.OS === "android"
			? { paddingVertical: 12 }
			: { paddingVertical: 18 };

	return (
		<KeyboardAwareScrollView
			className="flex-1 bg-red-700"
			enableOnAndroid={true}
			extraScrollHeight={5}
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			{/* Logo section */}
			<View
				className="items-center justify-center my-16"
				style={{
					paddingTop: Platform.OS === "android" ? 48 : 64,
					paddingBottom: Platform.OS === "android" ? 32 : 48,
				}}
			>
				<PulsingLogo
					source={SibklText as ImageSourcePropType}
					className="h-18"
				/>
			</View>

			<View className="bg-background py-8 px-6 rounded-t-[30px] flex-1">
				<Text className="text-3xl font-bold text-gray-700 mb-2">
					New Here?
				</Text>
				<Text className="font-regular text-gray-700 mb-6">
					Welcome! Enter your name, email, or phone to find an
					existing profile. Or create a new one.
				</Text>

				{/* Search input */}
				<View className="ml-[-2px]">
					<Text className="font-semibold text-gray-700 ml-1 mb-2">
						Search for an existing profile
					</Text>
					<View className="flex-row items-center bg-white border border-border rounded-[15px] px-4">
						<User2Icon size={20} color="#6b7280" />
						<TextInput
							className="font-regular flex-1 ml-3"
							style={inputPadding}
							placeholder="Search by name, email, or phone"
							value={nameQuery}
							onChangeText={setNameQuery}
							placeholderTextColor="#9ca3af"
							keyboardType="email-address"
							autoCapitalize="none"
							autoComplete="email"
						/>
						<TouchableOpacity onPress={() => setNameQuery("")}>
							<XIcon size={20} color="#6b7280" />
						</TouchableOpacity>
					</View>
				</View>

				{visibleProfiles.length > 0 && nameQuery && (
					<Text className="font-semibold text-gray-700 ml-1 mb-2 mt-6">
						Then, select a profile that matches:
					</Text>
				)}

				{/* List */}
				<FlashList
					data={visibleProfiles}
					keyExtractor={(item) => item.id.toString()}
					estimatedItemSize={80}
					ListEmptyComponent={
						nameQuery.length > 0 ? (
							<View className="mt-4">
								<Text className="text-gray-500 text-center italic">
									{"Cannot find profile for " +
										`"${nameQuery}"` +
										" ?"}
								</Text>
								<Text className="text-gray-500 text-center italic">
									Please create a new account.
								</Text>
							</View>
						) : null
					}
					renderItem={({ item }) => <ProfileItem item={item} />}
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.5}
					ListFooterComponent={
						loadingMore ? (
							<ActivityIndicator
								size="small"
								color="#007AFF"
								className="my-4"
							/>
						) : (
							<>
								<View className="flex-row items-center mt-4">
									<View className="flex-1 h-[1px] bg-gray-300" />
									<Text className="mx-4 text-gray-500 font-semibold">
										or
									</Text>
									<View className="flex-1 h-[1px] bg-gray-300" />
								</View>

								<TouchableOpacity
									className="w-full rounded-[15px] items-center justify-center mt-6 bg-primary-600"
									style={{
										paddingVertical:
											Platform.OS === "android" ? 14 : 16,
									}}
									onPress={() => {
										claimStore.setSelectedProfile(null);
										router.push("/(auth)/new-account");
									}}
								>
									<Text className="text-lg text-white font-bold">
										Create New Account
									</Text>
								</TouchableOpacity>

								<View className="mt-6 items-center">
									<Text className="font-regular text-gray-600 text-sm">
										Already have an account?{" "}
										<Link href="/sign-in" asChild>
											<Text className="text-primary-600 font-semibold">
												Sign In
											</Text>
										</Link>
									</Text>
								</View>
							</>
						)
					}
				/>
			</View>
		</KeyboardAwareScrollView>
	);
};

export default Page;
