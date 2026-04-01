import DynamicFormField from "@/components/shared/DynamicFormField";
import SharedBody from "@/components/shared/SharedBody";
import { groupedPersonFields } from "@/constants/const_person";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { updatePeople } from "@/services/Person/person.service";
import { Person } from "@/services/Person/person.type";
import { useAuthStore } from "@/stores/authStore";
import { SectionEnum } from "@/types/TableField.type";
import { formatPhone, myToast } from "@/utils/helper";
import {
	getAgeGroup,
	pickFieldsBySection,
	validatePerson,
} from "@/utils/helper_profile";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

import React, { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
	ActivityIndicator,
	Image,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";

// Create a type using those keys
export type ProfileFormData = Partial<Person>;

const UpdateProfilePage = () => {
	const authStore = useAuthStore();
	const { user: appUser } = authStore;
	const qc = useQueryClient();

	// Fetch the logged-in user's profile
	const { data: currentPerson, isPending } = useSinglePersonQuery(
		appUser?.person?.id ?? -1,
	);

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
			full_legal_name: "",
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
				SectionEnum.PERSONAL_INFORMATION,
			);

			reset(personalInfoData as ProfileFormData);
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
			qc.invalidateQueries({ queryKey: ["people", currentPerson?.id] });
			Toast.show(myToast(response));
			if (response.success) {
				console.log("Profile updated successfully");
				router.back();
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

	// To disable save changes button when invalid
	const { full_legal_name, email } = useWatch({
		control,
	});
	const changeValid = useMemo(() => {
		return !!(full_legal_name && email);
	}, [full_legal_name, email]);

	if (isPending)
		return (
			<SharedBody>
				<ActivityIndicator />
			</SharedBody>
		);

	return (
		<>
			<KeyboardAwareScrollView
				className="flex-1 bg-background relative"
				enableOnAndroid={true}
				extraScrollHeight={60}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<View className="py-10 px-5">
					{/* Header / logo */}
					<View className="items-center mb-6 gap-1">
						<Image
							source={require("../../../../../assets/images/person.png")}
							className="w-20 h-20 rounded-xl"
							resizeMode="contain"
						/>
						<Text className="text-2xl font-bold">
							{full_legal_name}
						</Text>
						<Text className="font-regular text-text-secondary text-center">
							Keep your information up to date
						</Text>
					</View>

					<View>
						{Object.entries(groupedPersonFields)
							.filter(
								([section]) =>
									section ===
									SectionEnum.PERSONAL_INFORMATION,
							)
							.map(([section, fields]) => (
								<View key={section} className="mb-12">
									<Text className="ml-1 pb-2 text-lg font-semibold">
										{section}
									</Text>

									<View className="ml-1 pt-2 gap-y-4 border-t border-border">
										{fields
											.filter((f) => f.editable !== false)
											.map((field) => {
												return (
													<DynamicFormField
														key={field.key}
														field={field}
														control={control}
														disabled={
															field.key == "email"
														}
														errors={errors}
														onFieldUpdate={
															handleFieldUpdate
														}
														onFieldComplete={
															handleFieldComplete
														}
													/>
												);
											})}
									</View>
								</View>
							))}
					</View>
				</View>
			</KeyboardAwareScrollView>

			{/* Sticky button */}
			<TouchableOpacity
				className={`absolute bottom-0 w-full py-4 items-center justify-center mt-6 ${changeValid ? " bg-primary-600" : "bg-primary-100"}`}
				onPress={handleSubmit(onSubmit)}
				disabled={isSubmitting || !changeValid}
			>
				{isSubmitting ? (
					<ActivityIndicator color="white" />
				) : (
					<Text className="text-lg text-white font-bold">
						Save Changes
					</Text>
				)}
			</TouchableOpacity>
		</>
	);
};

export default UpdateProfilePage;
