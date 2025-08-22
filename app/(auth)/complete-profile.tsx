import { FormDateInput } from "@/components/shared/FormDateInput";
import { FormField } from "@/components/shared/FormField";
import { FormSelect } from "@/components/shared/FormSelect";
import { useAuthStore } from "@/stores/authStore";
import { signUpStore } from "@/stores/signUpStore";
import { AgeGroup } from "@/utils/types/utils.types";
import { DateTimePicker } from "@expo/ui/jetpack-compose";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
export type ProfileFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  marital_status: string;
  birth_date: string;
  occupation: string;
  age: string;
  age_group?: AgeGroup;
  address_line1: string;
  city: string;
  state: string;
  postcode: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
};
const Page = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { step1Data, setData } = signUpStore();
  const { signUp } = useAuthStore();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      first_name: step1Data.first_name,
      last_name: step1Data.last_name,
      email: step1Data.email,
      phone: "",
      gender: "male",
      marital_status: "",
      birth_date: "",
      occupation: "",
      age: "",
      age_group: AgeGroup.Age13_17,
      address_line1: "",
      city: "",
      state: "",
      postcode: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    console.log("Form submitted:", data);
    const user = await signUp(data.email, step1Data.password!, data);
    if (!user) {
      console.error("Something went wrong signing up ");
      return;
    }
    user.sendEmailVerification();
    router.push("/(auth)/verify-email");
  };

  // Watch birth_date for auto-calculating age + age_group
  const birthDate = useWatch({ control, name: "birth_date" });

  // useEffect(() => {
  //   if (birthDate) {
  //         const today = new Date();

  //   let age = today.getFullYear() - birthDate.getFullYear();

  //   const hasHadBirthdayThisYear =
  //     today.getMonth() > birthDate.getMonth() ||
  //     (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  //     if (!hasHadBirthdayThisYear) {
  //     age--;
  //   }

  //     const group = getAgeGroup(age);
  //     setValue("age", age.toString());
  //     setValue("age_group", group);
  //   }
  // }, [birthDate, setValue]);

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraScrollHeight={60} // 👈 pushes inputs above keyboard
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <SafeAreaView className="flex-1 bg-background mb-4">
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
            <Text className="text-2xl font-bold text-text">
              Complete Profile
            </Text>
            <Text className="text-text-secondary mt-2 text-center">
              You&apos;re almost there!!
            </Text>
          </View>
        </View>

        <View className="px-5">
          <FormField
            name="first_name"
            label="First Name (required)"
            control={control}
            rules={{ required: "First name is required" }}
            errors={errors}
            placeholder="Enter first name"
          />

          <FormField
            name="last_name"
            label="Last Name (required)"
            control={control}
            rules={{ required: "Last name is required" }}
            errors={errors}
            placeholder="Enter last name"
          />

          <FormField
            name="email"
            label="Email (required)"
            control={control}
            errors={errors}
            placeholder="Email from store"
            editable={false}
          />

          <FormField
            name="phone"
            label="Phone (optional)"
            control={control}
            errors={errors}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <FormSelect
            name="gender"
            label="Gender (optional)"
            control={control}
            errors={errors}
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]}
          />

          <FormSelect
            name="marital_status"
            label="Marital Status (optional)"
            control={control}
            errors={errors}
            options={[
              { label: "Single", value: "Single" },
              { label: "Married", value: "Married" },
              { label: "Divorced", value: "Divorced" },
              { label: "Widowed", value: "Widowed" },
            ]}
          />

          <FormDateInput
            name="birth_date"
            label="Birth Date (optional)"
            control={control}
            errors={errors}
            // onDateChange={(date) => {
            //   const age = calculateAge(date);
            //   setValue("age", String(age));
            //   setValue("age_group", getAgeGroup(age));
            // }}
          />

          <FormField
            name="age"
            label="Age (optional)"
            control={control}
            errors={errors}
            editable={false}
          />

          <FormField
            name="age_group"
            label="Age Group"
            control={control}
            errors={errors}
            editable={false}
          />

          <FormField
            name="occupation"
            label="Occupation (optional)"
            control={control}
            errors={errors}
            placeholder="Enter occupation"
          />

          <FormField
            name="address_line1"
            label="Address Line 1 (optional)"
            control={control}
            errors={errors}
            placeholder="Enter address"
          />

          <FormField
            name="city"
            label="City (optional)"
            control={control}
            errors={errors}
            placeholder="Enter city"
          />

          <FormField
            name="state"
            label="State (optional)"
            control={control}
            errors={errors}
            placeholder="Enter state"
          />

          <FormField
            name="postcode"
            label="Postcode (optional)"
            control={control}
            errors={errors}
            placeholder="Enter postcode"
            keyboardType="numeric"
          />

          <FormField
            name="emergency_contact_name"
            label="Emergency Contact Name (optional)"
            control={control}
            errors={errors}
            placeholder="Enter name"
          />

          <FormField
            name="emergency_contact_phone"
            label="Emergency Contact Phone (optional)"
            control={control}
            errors={errors}
            placeholder="Enter phone"
            keyboardType="phone-pad"
          />

          <FormSelect
            name="emergency_contact_relationship"
            label="Emergency Contact Relationship (optional)"
            control={control}
            errors={errors}
            options={[
              { label: "Father", value: "Father" },
              { label: "Mother", value: "Mother" },
              { label: "Guardian", value: "Guardian" },
              { label: "Spouse", value: "Spouse" },
              { label: "Sibling", value: "Sibling" },
              { label: "Friend", value: "Friend" },
            ]}
          />
        </View>

        {/* Complete button */}
        <TouchableOpacity
          className="bg-primary-600 p-4 rounded-lg mt-4 mx-5"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text className="text-white text-center font-semibold">
            {isSubmitting ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
};

export default Page;
