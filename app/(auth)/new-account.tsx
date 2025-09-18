import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const Page = () => {
  type signUpFormData = {
    email: string;
    password: string;
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<signUpFormData>({
    defaultValues: { email: "", password: "" },
  });

  const signUp = (email: string, password: string) => {
    console.log(
      "sneding verification email for this email:",
      email,
      "and password:",
      password
    );
  };

  const onSubmit = async (data: signUpFormData) => {
    try {
      await signUp(data.email, data.password);
      Alert.alert("Success", "Account created successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create account.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-6 py-8"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold mb-6">Create New Account</Text>

        {/* Email */}
        <Controller
          control={control}
          name="email"
          rules={{ required: "Email is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
        />
        {errors.email && (
          <Text className="text-red-500 mb-2">{errors.email.message}</Text>
        )}

        {/* Password */}
        <Controller
          control={control}
          name="password"
          rules={{ required: "Password is required", minLength: 6 }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
              placeholder="Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
            />
          )}
        />
        {errors.password && (
          <Text className="text-red-500 mb-2">
            {errors.password.type === "minLength"
              ? "Password must be at least 6 characters"
              : errors.password.message}
          </Text>
        )}

        {/* Submit */}
        <TouchableOpacity
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="bg-primary-600 rounded-lg py-3 mt-4 items-center"
        >
          <Text className="text-white font-semibold text-base">
            {isSubmitting ? "Creating..." : "Create Account"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Page;
