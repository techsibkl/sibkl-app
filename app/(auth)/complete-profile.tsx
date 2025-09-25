import { FormDateInput } from "@/components/shared/FormDateInput";
import { FormField } from "@/components/shared/FormField";
import { FormSelect } from "@/components/shared/FormSelect";
import SharedBody from "@/components/shared/SharedBody";
import { useSinglePersonQuery } from "@/hooks/People/useSinglePersonQuery";
import { updatePeople } from "@/services/Person/person.service";
import { Person } from "@/services/Person/person.type";
import { useAuthStore } from "@/stores/authStore";
import { useClaimStore } from "@/stores/claimStore";
import { useSignUpStore } from "@/stores/signUpStore";
import { AgeGroup } from "@/utils/types/utils.types";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
	ActivityIndicator,
	Image,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
export type ProfileFormData = Pick<
	Person,
	| "first_name"
	| "last_name"
	| "email"
	| "phone"
	| "gender"
	| "marital_status"
	| "birth_date"
	| "occupation"
	| "age"
	| "age_group"
	| "address_line1"
	| "city"
	| "state"
	| "postcode"
	| "emergency_contact_name"
	| "emergency_contact_phone"
	| "emergency_contact_relationship"
>;
const Page = () => {
	const { pendingSignUp } = useSignUpStore();
	const { selectedProfile } = useClaimStore();
	const { data: person, isPending } = useSinglePersonQuery(
		Number(selectedProfile?.id)
	);
	const { signUp, setUser, firebaseUser } = useAuthStore();
	const router = useRouter();
	// console.log("selected profile:", selectedProfile);
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ProfileFormData>({
		defaultValues: {
			first_name: "",
			last_name: "",
			email: pendingSignUp?.email ?? "",
			phone: "",
			gender: "male",
			marital_status: "",
			birth_date: null,
			occupation: "",
			age: undefined,
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

	// ✅ When selectedProfile changes, update the form values
	// when person data comes from React Query, preset the form
	useEffect(() => {
		if (person) {
			reset({
				first_name: person.first_name ?? "",
				last_name: person.last_name ?? "",
				email: person.email ?? "",
				phone: person.phone ?? "",
				gender: person.gender === "female" ? "female" : "male",
				marital_status: person.marital_status ?? "",
				birth_date: person.birth_date,
				occupation: person.occupation ?? "",
				age: person.age ?? 0,
				age_group: person.age_group ?? AgeGroup.Age13_17,
				address_line1: person.address_line1 ?? "",
				city: person.city ?? "",
				state: person.state ?? "",
				postcode: person.postcode ?? "",
				emergency_contact_name: person.emergency_contact_name ?? "",
				emergency_contact_phone: person.emergency_contact_phone ?? "",
				emergency_contact_relationship:
					person.emergency_contact_relationship ?? "",
			});

			console.log("✅ Filled form with person data");
		}
	}, [person, reset]);

	const onSubmit = async (data: ProfileFormData) => {
		console.log("Form submitted:", data);
		if (selectedProfile) {
			const formPerson: Partial<Person> = {
				id: selectedProfile.id,
				...data,
			};

			try {
				const response = await updatePeople(formPerson);
				if (response.success) {
					console.log(
						"successfully updated the profile, moving you to the home, you should be able to access"
					);
					const appUser = {
						uid: firebaseUser?.uid!,
						email: firebaseUser?.email || person?.email || "",
						people_id: person?.id!,
						person: person!,
					};
					setUser(appUser);
					router.push("/(app)/home");
				}
			} catch (error) {
				console.error("Error updating person profile:", error);
				return;
			}
		}
		if (!selectedProfile) {
			const user = await signUp(data);
			if (!user) {
				console.error("Something went wrong signing up ");
				return;
			}
		}

		router.push("/(app)/home");
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

	if (isPending)
		return (
			<SharedBody>
				<ActivityIndicator />
			</SharedBody>
		);

	return (
		<KeyboardAwareScrollView
			enableOnAndroid={true}
			extraScrollHeight={60} // 👈 pushes inputs above keyboard
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<SharedBody>
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
					className="bg-primary-600 p-4 rounded-[15px] mt-4 mx-5"
					onPress={handleSubmit(onSubmit)}
					disabled={isSubmitting}
				>
					<Text className="text-white text-center font-semibold">
						{isSubmitting ? "Submitting..." : "Submit"}
					</Text>
				</TouchableOpacity>
			</SharedBody>
		</KeyboardAwareScrollView>
	);
};

export default Page;
