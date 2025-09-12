import { useClaimStore } from "@/stores/claimStore";
import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Page = () => {
  const { foundProfiles, selectedProfile, setSelectedProfile, reset } =
    useClaimStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();

  const handleProfileSelect = (profile: any) => {
    setSelectedProfile(profile);
    setShowConfirmDialog(true);
  };

  const handleConfirmClaim = () => {
    if (selectedProfile) {
      console.log("Claiming profile:", selectedProfile);
      setShowConfirmDialog(false);
      setSelectedProfile(selectedProfile);
      // reset();
      router.push("/(auth)/complete-profile");
    }
  };

  const handleSkip = () => {
    reset();
    router.push("/(auth)/complete-profile");
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-6 py-8">
      <View className="mb-8">
        <Text className="text-2xl font-bold text-text mb-2">
          Claim Your Account
        </Text>
        <Text className="text-text-secondary text-base">
          We found some profiles that might be yours. Select the correct one to
          claim your account.
        </Text>
      </View>

      <View className="mb-8">
        <Text className="text-lg font-semibold text-text mb-4">
          Found Profiles
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {foundProfiles.map((profile) => (
            <TouchableOpacity
              key={profile.id}
              onPress={() => handleProfileSelect(profile)}
              className="bg-card rounded-xl p-4 border border-border shadow-card active:bg-card-hover mb-3"
            >
              <View className="flex-row items-center gap-1">
                <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center">
                  <Image
                    source={require("../../assets/images/person.png")}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-text mb-1">
                    {profile.full_name}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Mail size={14} color="#6B7280" />
                    <Text className="text-sm text-text-secondary">
                      {profile.email}
                    </Text>
                  </View>
                </View>
                <Text className="text-text-tertiary text-lg">›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="mt-auto">
        <TouchableOpacity
          onPress={handleSkip}
          className="border border-dashed border-border rounded-xl py-4 px-6 items-center active:bg-card-hover"
        >
          <Text className="text-text-secondary text-base">
            I don&apos;t see my account, Create New Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmDialog(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-card rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-text mb-3 text-center">
              Confirm Account Claim
            </Text>
            {selectedProfile && (
              <View className="mb-6">
                <Text className="text-text-secondary text-center mb-4">
                  Are you sure you want to claim this profile?
                </Text>
                <View className="bg-gray-50 rounded-xl p-4 flex-row items-center gap-1">
                  <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center">
                    <Image
                      source={require("../../assets/images/person.png")}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-text">
                      {selectedProfile.full_name}
                    </Text>
                    <Text className="text-sm text-text-secondary">
                      {selectedProfile.email}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowConfirmDialog(false)}
                className="flex-1 py-3 px-4 border border-border rounded-xl items-center active:bg-card-hover"
              >
                <Text className="text-text font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmClaim}
                className="flex-1 py-3 px-4 bg-primary-600 rounded-xl items-center active:bg-primary-700"
              >
                <Text className="text-white font-medium">Claim Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Page;
