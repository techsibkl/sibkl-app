import { FormField } from "@/components/shared/FormField";
import { signUpStore } from "@/stores/signUpStore";
import { Link, useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface SignUpFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
}

const Page = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { step1Data, setData } = signUpStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      email: step1Data.email || "thomasawtoft@gmail.com",
      password: step1Data.password || "123456",
      first_name: step1Data.first_name || "Rachel",
      last_name: step1Data.last_name || "Choo",
      phone: step1Data.phone || "0127412466",
    },
  });

  const onSubmit = (values: SignUpFormData) => {
    setData(values);
    console.log("Saved in store:", signUpStore.getState().step1Data);

    // Fire an api to see if got result for anyone matching the info that was just submitted
    const hasPotentialMatches = false;
    if(hasPotentialMatches){
      console.log("Found Potential Account Matches")
      router.push("/(auth)/claim")
    } else {
      console.log("No Account Matches Found")
      router.push("/(auth)/complete-profile")
    }
  };

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
              <Text className="text-2xl font-bold text-text">New Here</Text>
              <Text className="text-text-secondary mt-2 text-center">
                Create your account
              </Text>
            </View>

            <View className="space-y-6">
              {/* Email */}
              <FormField
                name="email"
                label="Email"
                control={control}
                errors={errors}
                icon={<Mail size={20} color="#6b7280" />}
                rules={{
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
              />

              {/* Password */}
              <FormField
                name="password"
                label="Password"
                control={control}
                errors={errors}
                icon={<Lock size={20} color="#6b7280" />}
                rules={{
                  required: "Password is required",
                  minLength: { value: 6, message: "At least 6 characters" },
                }}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#9ca3af" />
                    ) : (
                      <Eye size={20} color="#9ca3af" />
                    )}
                  </TouchableOpacity>
                }
              />

              {/* First Name */}
              <FormField
                name="first_name"
                label="First Name"
                control={control}
                errors={errors}
                rules={{ required: "First name is required" }}
                placeholder="Enter your first name"
              />

              {/* Last Name */}
              <FormField
                name="last_name"
                label="Last Name"
                control={control}
                errors={errors}
                rules={{ required: "Last name is required" }}
                placeholder="Enter your last name"
              />

              {/* Phone */}
              <FormField
                name="phone"
                label="Phone Number"
                control={control}
                errors={errors}
                rules={{ required: "Phone number is required" }}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />

              {/* Submit button */}
              <TouchableOpacity
                className="w-full h-12 bg-primary-600 rounded-lg items-center justify-center mb-6"
                onPress={handleSubmit(onSubmit)}
              >
                <Text className="text-white font-semibold text-base">
                  Sign Up
                </Text>
              </TouchableOpacity>

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
