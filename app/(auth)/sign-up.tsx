import ProfileItem from "@/components/Auth/ProfileItem";
import SharedBody from "@/components/shared/SharedBody";
import { formStyles } from "@/constants/const_styles";
import { usePeopleWithNouidQuery } from "@/hooks/People/usePeopleWithNoUid";
import { useClaimStore } from "@/stores/claimStore";
import { FlashList } from "@shopify/flash-list";
import { Link, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
	ActivityIndicator,
	Image,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

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

	// Filter logic
	const filteredProfiles = useMemo(() => {
		return nameQuery
			? (maskedPeople ?? []).filter((person) => {
					return person?.full_name
						?.toLowerCase()
						.includes(nameQuery.trim().toLowerCase());
				})
			: [];
	}, [nameQuery, maskedPeople]);

	// Paginate results
	const visibleProfiles = useMemo(
		() => filteredProfiles.slice(0, page * PAGE_SIZE),
		[filteredProfiles, page]
	);

	const handleLoadMore = () => {
		if (page * PAGE_SIZE < filteredProfiles.length && !loadingMore) {
			setLoadingMore(true);
			setTimeout(() => {
				setPage((prev) => prev + 1);
				setLoadingMore(false);
			}, 300); // Simulate async
		}
	};

	if (isPending)
		return (
			<SharedBody>
				<ActivityIndicator />
			</SharedBody>
		);
	if (isError)
		return (
			<SharedBody>
				{/* <Text>{JSON.stringify(error)}</Text> */}
				<Text>{error.message}</Text>
				<Text>{error.name}</Text>
			</SharedBody>
		);

	return (
		<KeyboardAwareScrollView
			className="flex-1 px-6 py-8 bg-background"
			enableOnAndroid={true}
			extraScrollHeight={60} // 👈 pushes inputs above keyboard
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<View className="max-w-sm mx-auto w-full">
				{/* Logo */}
				<View className="items-center mb-12 mt-8">
					<View className="w-24 h-24 bg-gray-200 rounded-2xl items-center justify-center mb-4">
						<Image
							source={{
								uri: "https://via.placeholder.com/96x96/e5e7eb/6b7280?text=LOGO",
							}}
							className="w-20 h-20 rounded-xl"
							resizeMode="contain"
						/>
					</View>
					<Text className="text-2xl font-bold text-text">
						New Here?
					</Text>
					<Text className="text-text-secondary mt-2 text-center">
						SIBKL has an extensive database of our members your info
						might already be with us
					</Text>
					<Text className="text-text-secondary mt-2 text-center">
						Enter your first and last name to help you find out
					</Text>
				</View>

				{/* Inputs */}
				<View>
					<TextInput
						placeholder="Search by name"
						value={nameQuery}
						onChangeText={setNameQuery}
						className={formStyles.inputText}
					/>
				</View>

				{/* List */}
				<FlashList
					data={visibleProfiles}
					keyExtractor={(item) => item.id.toString()}
					estimatedItemSize={81}
					ListEmptyComponent={
						<View className="my-4">
							{nameQuery.length > 0 && (
								<>
									<Text className="text-gray-500 text-center italic">
										{"Cannot find profile for " +
											`"${nameQuery}"`}
										{" ?"}
									</Text>
									<Text className="text-gray-500 text-center italic">
										Please create a new account.
									</Text>
								</>
							)}
						</View>
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
							<TouchableOpacity
								className="w-full py-4 rounded-[15px] items-center justify-center my-4 bg-primary-600"
								onPress={() => {
									claimStore.setSelectedProfile(null);
									router.push("/(auth)/new-account");
								}}
							>
								<Text className="text-white font-semibold">
									Create New Account
								</Text>
							</TouchableOpacity>
						)
					}
				/>

				<View className="space-y-6">
					{/* Sign in link */}
					<View className="items-center">
						<Text className="text-text text-sm">
							Already have an account?{" "}
							<Link href="/sign-in" asChild>
								<Text className="text-primary-600 font-semibold">
									Sign In
								</Text>
							</Link>
						</Text>
					</View>
				</View>
			</View>
		</KeyboardAwareScrollView>
	);
};

export default Page;
