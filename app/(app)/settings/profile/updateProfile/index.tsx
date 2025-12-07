import DynamicFormField from "@/components/shared/DynamicFormField";
import SharedBody from "@/components/shared/SharedBody";
import { groupedPersonFields } from "@/constants/const_person";
import { useSinglePersonQuery } from "@/hooks/People/useSinglePersonQuery";
import { updatePeople } from "@/services/Person/person.service";
import { Person } from "@/services/Person/person.type";
import { useAuthStore } from "@/stores/authStore";
import { SectionEnum } from "@/types/TableField.type";
import { formatPhone } from "@/utils/helper";
import {
  getAgeGroup,
  pickFieldsBySection,
  validatePerson,
} from "@/utils/helper_profile";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Create a type using those keys
export type ProfileFormData = Partial<Person>;

const UpdateProfilePage = () => {
  const authStore = useAuthStore();
  const { user: appUser } = authStore;

  // Fetch the logged-in user's profile
  const { data: currentPerson, isPending } = useSinglePersonQuery(appUser?.id);

  const [submitAttempted, setSubmitAttempted] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: appUser?.email ?? "",
      phone: "",
      gender: "male",
      marital_status: "",
      birth_date: null,
      occupation: "",
      age: undefined,
      age_group: null,
      address_line1: "",
      city: "",
      state: "",
      postcode: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
    },
  });

  // Prefill the form once user profile loads
  useEffect(() => {
    if (currentPerson) {
      const personalInfoData = pickFieldsBySection(
        currentPerson,
        SectionEnum.PERSONAL_INFORMATION
      );

      reset(personalInfoData as ProfileFormData);
      console.log("🔄 Prefilled form with current profile");
    }
  }, [currentPerson, reset]);

  // Submit update
  const onSubmit = async (data: ProfileFormData) => {
    clearErrors();
    setSubmitAttempted(true);

    const validationErrors = validatePerson(data);
    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        setError(field, { type: "manual", message });
      });
      return;
    }

    const formPerson: Partial<Person> = {
      id: currentPerson?.id,
      ...data,
    };

    try {
      const response = await updatePeople(formPerson);
      if (response.success) {
        console.log("Profile updated successfully");
        authStore.init(); // Refresh user session
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleFieldUpdate = (key: string, value: any) => {
    setValue(key, value);

    if (key === "age") {
      setValue("birth_date", null);
      setValue("age_group", getAgeGroup(value));
    }

    if (key === "age_group" && value) {
      setValue("birth_date", null);
      setValue("age", 0);
    }

    if (key === "birth_date" && value) {
      const birthDateObj = new Date(value);
      const today = new Date();

      let calculatedAge =
        today.getFullYear() - birthDateObj.getFullYear();

      const hadBirthday =
        today.getMonth() > birthDateObj.getMonth() ||
        (today.getMonth() === birthDateObj.getMonth() &&
          today.getDate() >= birthDateObj.getDate());

      if (!hadBirthday) calculatedAge--;

      setValue("age", calculatedAge);
      setValue("age_group", getAgeGroup(calculatedAge));
    }

    if (!submitAttempted) return;

    const currentData = getValues();
    const validationErrors = validatePerson(currentData);

    if (validationErrors[key]) {
      setError(key, {
        type: "manual",
        message: validationErrors[key],
      });
    }
  };

  const handleFieldComplete = (key: string, value: any) => {
    if (key === "phone" || key === "emergency_contact_phone") {
      setValue(key, formatPhone(value));
    }
  };

  if (isPending)
    return (
      <SharedBody>
        <ActivityIndicator />
      </SharedBody>
    );

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraScrollHeight={60}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <SharedBody>
        {/* Header / logo */}
        <View className="items-center mt-16 mb-6">
          <Image
            source={require("../../../../../assets/images/person.png")}
            className="w-20 h-20 rounded-xl"
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-text">Update Profile</Text>
          <Text className="text-text-secondary mt-1 text-center">
            Keep your information up to date
          </Text>
        </View>

        <View className="px-5 pt-4">
          {Object.entries(groupedPersonFields)
            .filter(([section]) => section === SectionEnum.PERSONAL_INFORMATION)
            .map(([section, fields]) => (
              <View key={section} className="mb-12">
                <Text className="ml-1 mb-4 pb-2 text-black font-semibold border-b border-gray-300">
                  {section}
                </Text>

                <View className="gap-y-6">
                  {fields
                    .filter((f) => f.editable !== false)
                    .map((field) => (
                      <DynamicFormField
                        key={field.key}
                        field={field}
                        control={control}
                        errors={errors}
                        onFieldUpdate={handleFieldUpdate}
                        onFieldComplete={handleFieldComplete}
                      />
                    ))}
                </View>
              </View>
            ))}
        </View>

        {/* Save button */}
        <TouchableOpacity
          className="bg-primary-600 p-4 rounded-[15px] mx-5 mb-20"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text className="text-white text-center font-semibold">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </SharedBody>
    </KeyboardAwareScrollView>
  );
};

export default UpdateProfilePage;
