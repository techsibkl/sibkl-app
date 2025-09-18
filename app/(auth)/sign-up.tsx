import ProfileItem from "@/components/Auth/ProfileItem";
import { usePeopleWithNouidQuery } from "@/hooks/People/usePeopleWithNoUid";
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
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 20;

const Page = () => {
  const router = useRouter();
  const {
    isPending,
    isError,
    error,
    data: maskedPeople,
  } = usePeopleWithNouidQuery();
  const [firstNameQuery, setFirstNameQuery] = useState("");
  const [lastNameQuery, setLastNameQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter logic
  const filteredProfiles = useMemo(() => {
    return (maskedPeople ?? []).filter((person) => {
      const matchFirst =
        firstNameQuery === "" ||
        person?.first_name
          ?.toLowerCase()
          .includes(firstNameQuery.toLowerCase());
      const matchLast =
        lastNameQuery === "" ||
        person?.last_name?.toLowerCase().includes(lastNameQuery.toLowerCase());
      return matchFirst && matchLast;
    });
  }, [firstNameQuery, lastNameQuery, maskedPeople]);

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
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
        <ActivityIndicator />
      </SafeAreaView>
    );
  if (isError)
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
        {/* <Text>{JSON.stringify(error)}</Text> */}
        <Text>{error.message}</Text>
        <Text>{error.name}</Text>
      </SafeAreaView>
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
          <Text className="text-2xl font-bold text-text">New Here?</Text>
          <Text className="text-text-secondary mt-2 text-center">
            SIBKL has an extensive database of our members your info might
            already be with us
          </Text>
          <Text className="text-text-secondary mt-2 text-center">
            Enter your first and last name to help you find out
          </Text>
        </View>

        {/* Inputs */}
        <View className="mb-4">
          <TextInput
            placeholder="First name"
            value={firstNameQuery}
            onChangeText={setFirstNameQuery}
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-3"
          />
          <TextInput
            placeholder="Last name"
            value={lastNameQuery}
            onChangeText={setLastNameQuery}
            className="bg-white border border-gray-300 rounded-lg px-4 py-3"
          />
        </View>

        {/* List */}
        <FlashList
          data={visibleProfiles}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={80}
          ListEmptyComponent={
            <View>
              <Text className="text-gray-500 text-center">
                We Could Not find a profile matching
              </Text>
              <Text className="text-gray-500 text-center">
                &ldquo;{firstNameQuery + " " + lastNameQuery}&ldquo;{" "}
              </Text>

              <TouchableOpacity
                className="mt-3 w-full h-12 rounded-lg items-center justify-center mb-6 bg-primary-600"
                onPress={() => router.push("/(auth)/new-account")}
              >
                <Text className="text-white font-semibold text-base">
                  Create Account Instead?
                </Text>
              </TouchableOpacity>
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
            ) : null
          }
        />

        <View className="space-y-6">
          {/* Sign in link */}
          <View className="items-center">
            <Text className="text-text text-sm">
              Already have an account?{" "}
              <Link href="/sign-in" asChild>
                <Text className="text-primary-600 font-semibold">Sign In</Text>
              </Link>
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Page;
