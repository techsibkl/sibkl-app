import auth from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChangeEmailScreen() {
  const router = useRouter();
  const user = auth().currentUser;

  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSave = async () => {
    setError("");
    setLoading(true);

    try {
      if (!user) throw new Error("User not logged in");

      // 1. Re-authenticate user
      const credential = auth.EmailAuthProvider.credential(
        user.email!,
        password
      );
      await user.reauthenticateWithCredential(credential);

      // 2. Update email
      await user.updateEmail(newEmail);

      setLoading(false);
      router.back(); // navigate back after success
    } catch (err: any) {
      setLoading(false);
      console.log(err);
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      {/* Header */}
      <Text className="text-3xl font-semibold text-gray-900">Change Email</Text>
      <Text className="text-gray-500 mt-1">Your current email is:</Text>
      <Text className="text-gray-800 font-medium mb-6">{user?.email}</Text>

      {/* Form Card */}
      <View className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mb-4">
        <View className="mb-4">
          <Text className="text-gray-600 mb-1">New Email</Text>
          <View className="flex-row items-center bg-white p-3 rounded-xl border border-gray-300">
            <Mail size={20} color="#9ca3af" />
            <TextInput
              placeholder="Enter new email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={newEmail}
              onChangeText={setNewEmail}
              className="flex-1 ml-2 text-gray-800"
            />
          </View>
        </View>

        <View>
          <Text className="text-gray-600 mb-1">Confirm Password</Text>
          <View className="flex-row items-center bg-white p-3 rounded-xl border border-gray-300">
            <Lock size={20} color="#9ca3af" />
            <TextInput
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              className="flex-1 ml-2 text-gray-800"
            />
          </View>
        </View>
      </View>

      {/* Error */}
      {error ? <Text className="text-red-500 mb-3">{error}</Text> : null}

      {/* Save Button */}
      <TouchableOpacity
        onPress={onSave}
        disabled={loading}
        className="bg-blue-600 py-4 rounded-2xl items-center"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
