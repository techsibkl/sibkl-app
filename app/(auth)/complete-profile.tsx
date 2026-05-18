import DynamicFormField from "@/components/shared/DynamicFormField";
import SharedBody from "@/components/shared/SharedBody";
import SkeletonPeopleRow from "@/components/shared/Skeleton/SkeletonPeopleRow";
import { DEFAULT_PERSON_COLUMNS } from "@/constants/const_person";
import { handleAuthStateChange } from "@/hooks/Auth/useAuthHandler";
import { useSinglePersonQuery } from "@/hooks/People/usePeopleQuery";
import { updatePeople } from "@/services/Person/person.service";
import { Person } from "@/services/Person/person.type";
import { useAuthStore } from "@/stores/authStore";
import { useClaimStore } from "@/stores/claimStore";
import { useSignUpStore } from "@/stores/signUpStore";
import { SectionEnum } from "@/types/TableField.type";
import { formatPhone } from "@/utils/helper";
import {
	getAgeGroup,
	getInitials,
	validateCompleteProfile,
} from "@/utils/helper_profile";
import { getAuth } from "@react-native-firebase/auth";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export type ProfileFormData = Partial<Person>;

const completeProfileFields = DEFAULT_PERSON_COLUMNS.filter(
	(f) => f.completeProfileOnly === true,
);

const groupedCompleteProfileFields = completeProfileFields.reduce(
	(acc, field) => {
		if (!field.section || field.section == SectionEnum.NONE) return acc;
		const section = field.section;
		if (!acc[section]) acc[section] = [];
		acc[section].push(field);
		return acc;
	},
	{} as Record<string, typeof completeProfileFields>,
);

const Page = () => {
	const { pendingSignUp } = useSignUpStore();
	const { signUp, user: appUser, firebaseUser } = useAuthStore();
	const { selectedProfile } = useClaimStore();
	const { bottom } = useSafeAreaInsets();
	const { claimedPeopleId } = useLocalSearchParams();
	const routeClaimedPeopleId = Array.isArray(claimedPeopleId)
		? claimedPeopleId[0]
		: claimedPeopleId;
	const claimedPeopleIdNumber = routeClaimedPeopleId
		? Number(routeClaimedPeopleId)
		: undefined;
	const activeClaimedPeopleId =
		selectedProfile?.id ??
		(Number.isFinite(claimedPeopleIdNumber)
			? claimedPeopleIdNumber
			: undefined);
	const { data: selectedPerson, isPending } = useSinglePersonQuery(
		activeClaimedPeopleId ?? -1,
	);
	const profileEmail =
		pendingSignUp?.email ||
		appUser?.email ||
		firebaseUser?.email ||
		"";
	const [submitAttempted, setSubmitAttempted] = useState(false);

	const {
		control,
		handleSubmit,
		reset,
		getValues,
		setValue,
		watch,
		setError,
		clearErrors,
		formState: { errors, isSubmitting },
	} = useForm<ProfileFormData>({
		defaultValues: {
			full_legal_name: "",
			email: profileEmail,
			phone: "",
			birth_date: null,
			age: undefined,
			age_group: null,
		},
	});

	useEffect(() => {
		if (selectedPerson) {
			const profileData = completeProfileFields.reduce((acc, field) => {
				if (field.key in selectedPerson) {
					acc[field.key] = selectedPerson[field.key];
				}
				return acc;
			}, {} as ProfileFormData);
			reset(profileData);
		}
	}, [selectedPerson, reset]);

	useEffect(() => {
		if (!selectedPerson && profileEmail && !getValues("email")) {
			setValue("email", profileEmail);
		}
	}, [getValues, profileEmail, selectedPerson, setValue]);

	const onSubmit = async (data: ProfileFormData) => {
		clearErrors();
		setSubmitAttempted(true);
		const validationErrors = validateCompleteProfile(data);

		if (Object.keys(validationErrors).length > 0) {
			Object.entries(validationErrors).forEach(([field, message]) => {
				setError(field, { type: "manual", message });
			});
			Toast.show({
				type: "error",
				text1Style: { fontSize: 16, fontWeight: "bold" },
				text1: "Please enter valid input",
			});
			return;
		}

		if (activeClaimedPeopleId) {
			try {
				const response = await updatePeople({
					id: activeClaimedPeopleId,
					...data,
				});
				if (response.success) {
					await handleAuthStateChange(
						getAuth().currentUser,
						useAuthStore.setState,
					);
				}
			} catch (error) {
				console.error("Error updating person profile:", error);
			}
		} else {
			const user = await signUp(data);
			if (!user) {
				console.error("Something went wrong signing up");
				return;
			}
			await handleAuthStateChange(
				getAuth().currentUser,
				useAuthStore.setState,
			);
		}
	};

	const handleFieldUpdate = (key: string, value: any) => {
		setValue(key, value);

		if (key === "age") {
			const parsed = parseInt(value);
			setValue("birth_date", null);
			setValue("age_group", getAgeGroup(isNaN(parsed) ? 0 : parsed));
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
			const hasHadBirthdayThisYear =
				today.getMonth() > birthDateObj.getMonth() ||
				(today.getMonth() === birthDateObj.getMonth() &&
					today.getDate() >= birthDateObj.getDate());
			if (!hasHadBirthdayThisYear) calculatedAge--;

			setValue("age", calculatedAge);
			setValue("age_group", getAgeGroup(calculatedAge));
		}

		if (!submitAttempted) return;
		const currentData = getValues();
		const validationErrors = validateCompleteProfile(currentData);
		if (validationErrors[key]) {
			setError(key as any, {
				type: "manual",
				message: validationErrors[key],
			});
		}
	};

	const handleFieldComplete = (key: string, value: any) => {
		if (key === "phone") {
			setValue(key, formatPhone(value));
		}
	};

	const fullName = watch("full_legal_name");
	const REQUIRED_FIELDS = ["full_legal_name", "email", "phone"];
	if (isPending) {
		return (
			<SharedBody>
				<SkeletonPeopleRow />
			</SharedBody>
		);
	}

	return (
		<>
			<KeyboardAwareScrollView
				className="flex-1 bg-background relative"
				enableOnAndroid={true}
				extraScrollHeight={60}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<SharedBody>
					<View className="items-center my-6">
						<View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center mb-4">
							<Text className="text-lg font-bold">
								{getInitials(fullName)}
							</Text>
						</View>
						<Text className="text-2xl font-bold text-text">
							{fullName ? `Welcome, ${fullName}!` : "Welcome!"}
						</Text>
						<Text className="text-text-secondary mt-1 text-center">
							You&apos;re almost there!!
						</Text>
					</View>

					<View
						className="px-5 pt-4"
						style={{ paddingBottom: bottom + 80 }}
					>
						{Object.entries(groupedCompleteProfileFields).map(
							([section, fields]) => (
								<View key={section} className="mb-12">
									<View className="gap-y-6">
										{fields.map((field) => (
											<DynamicFormField
												key={field.key}
												field={field}
												control={control}
												errors={errors}
												onFieldUpdate={
													handleFieldUpdate
												}
												onFieldComplete={
													handleFieldComplete
												}
												disabled={field.key === "email"}
												placeholder={
													REQUIRED_FIELDS.includes(
														field.key,
													)
														? `${field.header}`
														: `${field.header} (Optional)`
												}
											/>
										))}
									</View>
								</View>
							),
						)}
					</View>
				</SharedBody>
			</KeyboardAwareScrollView>

			<TouchableOpacity
				className="absolute bottom-0 w-full items-center justify-center bg-primary-600"
				style={{ paddingBottom: bottom + 16, paddingTop: 16 }}
				onPress={handleSubmit(onSubmit)}
				disabled={isSubmitting}
			>
				{isSubmitting ? (
					<ActivityIndicator color="white" />
				) : (
					<Text className="text-white text-center text-lg font-semibold">
						Submit
					</Text>
				)}
			</TouchableOpacity>
		</>
	);
};

export default Page;
