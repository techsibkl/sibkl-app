import { useAuthContext } from "@/context/AuthContext";
import { Link } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Page = () => {

  const [showPassword, setShowPassword] = useState<boolean>(false);
    const { signIn, isLoading } = useAuthContext();
  
    const {
      control,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
    } = useForm<LoginFormData>({
      defaultValues: {
        email: "",
        password: "",
        rememberMe: false,
      },
    });
  
    const onSubmit = async (data: LoginFormData): Promise<void> => {
      try {
        // For now, just use the toggle function from context
        signIn();
      } catch (error) {
        Alert.alert("Error", "Failed to sign in. Please try again.");
      }
    };

  return (
    <SafeAreaView className="flex-1 bg-white">
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
              New Here
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              Create your account
            </Text>
          </View>

          <View className="space-y-6">
            {/* Email input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
              <View className="relative">
                <View className="absolute left-3 top-3 z-10">
                  <Mail size={20} color="#6b7280" />
                </View>
                <Controller
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email format',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="pl-12 h-12 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
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
                  <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>
                )}
              </View>
            </View>

            {/* Password input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
              <View className="relative">
                <View className="absolute left-3 top-3 z-10">
                  <Lock size={20} color="#6b7280" />
                </View>
                <Controller
                  control={control}
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="pl-12 pr-12 h-12 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
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
                  <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>
                )}
              </View>
            </View>

            {/* Sign in button */}
            <TouchableOpacity
              className={`w-full h-12 rounded-lg items-center justify-center mb-6 ${
                isLoading ? 'bg-gray-400' : 'bg-blue-600'
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text className="text-white font-semibold text-base">
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            {/* Sign up link */}
            <View className="items-center">
              <Text className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link href="/sign-in" asChild>
                  <Text className="text-blue-600 font-semibold">Sign In</Text>
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
