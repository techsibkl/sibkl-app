import { FormField } from "@/components/shared/FormField";
import { sendOTP } from "@/services/OTP/otp.service";
import { useSignUpStore } from "@/stores/signUpStore";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const Page = () => {
  type signUpFormData = {
    email: string;
    password: string;
  };

  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const signUpStore = useSignUpStore();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<signUpFormData>({
    defaultValues: { email: "", password: "" },
  });

  const signUp = async (email: string, password: string) => {
    console.log("sending verification email for:", email);

    // 1. Send OTP
    const result = await sendOTP(null, email);
    console.log("result of sending OTP:", result);

    // 2. Save pending signup to store
    signUpStore.setPendingSignUp({ email, password });

    return result;
  };

  const onSubmit = async (data: signUpFormData) => {
    try {
      await signUp(data.email, data.password);

      // Navigate to OTP verification page
      router.push("/(auth)/verify-otp");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send verification code.");
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-6 py-8"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold mb-6">Create New Account</Text>

        {/* <Text className="text-2xl font-bold mb-6">
          {JSON.stringify(selectedProfile)}
        </Text> */}

        {/* Email */}
        <FormField
          name="email"
          label="Email"
          control={control}
          errors={errors}
        />

        {/* Password */}
        <FormField
          control={control}
          label="Password"
          name="password"
          rules={{ required: "Password is required", minLength: 6 }}
          errors={errors}
          secureTextEntry={!showPassword}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color="#9ca3af" />
              ) : (
                <Eye size={20} color="#9ca3af" />
              )}
            </TouchableOpacity>
          }
        />

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
