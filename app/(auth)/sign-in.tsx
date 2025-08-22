import { useAuthStore } from "@/stores/authStore";
import { Link } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Page = () => {
  const { signIn, user } = useAuthStore();

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "rayeschoo777@gmail.com",
      password: "123456",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      await signIn(data.email, data.password);
      // navigate to your home screen if needed
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to sign in. Please try again."
      );
    }
  };

  const toggleRememberMe = (): void => {
    const currentValue = watch("rememberMe");
    setValue("rememberMe", !currentValue);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-6 py-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="max-w-sm mx-auto w-full">
          {/* Logo - Replace with your app logo */}
          <View className="items-center mb-12 mt-8">
            <View className="w-24 h-24 bg-gray-200 rounded-2xl items-center justify-center mb-4">
              {/* Placeholder for your logo image */}
              <Image
                source={{
                  uri: "https://via.placeholder.com/96x96/e5e7eb/6b7280?text=LOGO",
                }}
                className="w-20 h-20 rounded-xl"
                resizeMode="contain"
              />
            </View>
            <Text className="text-2xl font-bold text-gray-800">
              Welcome Back
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              Sign in to your account
            </Text>
          </View>

          {/* Sign in form */}
          <View className="space-y-6">
            {/* Email input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-text mb-2">
                Email
              </Text>
              <View className="relative">
                <View className="absolute left-3 top-3 z-10">
                  <Mail size={20} color="#6b7280" />
                </View>
                <Controller
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email format",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="pl-12 h-12 bg-white border border-border rounded-lg text-text"
                      placeholder="Enter your email"
                      placeholderTextColor="#9ca3af"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  )}
                  name="email"
                />
                {errors.email && (
                  <Text className="text-primary-500 text-sm mt-1">
                    {errors.email.message}
                  </Text>
                )}
              </View>
            </View>

            {/* Password input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-text mb-2">
                Password
              </Text>
              <View className="relative">
                <View className="absolute left-3 top-3 z-10">
                  <Lock size={20} color="#6b7280" />
                </View>
                <Controller
                  control={control}
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="pl-12 pr-12 h-12 bg-white border border-border rounded-lg text-text"
                      placeholder="Enter your password"
                      placeholderTextColor="#9ca3af"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                    />
                  )}
                  name="password"
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9ca3af" />
                  ) : (
                    <Eye size={20} color="#9ca3af" />
                  )}
                </TouchableOpacity>
                {errors.password && (
                  <Text className="text-primary-500 text-sm mt-1">
                    {errors.password.message}
                  </Text>
                )}
              </View>
            </View>

            {/* Remember me and forgot password */}
            <View className="flex-row items-center justify-between mb-8">
              <Controller
                control={control}
                render={({ field: { value } }) => (
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={toggleRememberMe}
                  >
                    <View
                      className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${
                        value
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {value && <Text className="text-white text-xs">✓</Text>}
                    </View>
                    <Text className="text-sm text-gray-600">Remember me</Text>
                  </TouchableOpacity>
                )}
                name="rememberMe"
              />
              <Link href="/forgot-password" asChild>
                <TouchableOpacity>
                  <Text className="text-sm text-primary-600 font-medium">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Sign in button */}
            <TouchableOpacity
              className={`w-full h-12 rounded-lg items-center justify-center mb-6 ${"bg-primary-600"}`}
              onPress={handleSubmit(onSubmit)}
              // disabled={isLoading}
            >
              <Text className="text-white font-semibold text-base">
                {"Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Sign up link */}
            <View className="items-center">
              <Text className="text-gray-600 text-sm">
                Dont have an account?{" "}
                <Link href="/sign-up" asChild>
                  <Text className="text-primary-600 font-semibold">Sign Up</Text>
                </Link>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Page;
