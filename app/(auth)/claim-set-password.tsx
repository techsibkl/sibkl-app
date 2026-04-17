import { FormField } from "@/components/shared/FormField";
import PulsingLogo from "@/components/shared/PulsingLogo";
import { fetchPersonById } from "@/services/Person/person.service";
import { useClaimStore } from "@/stores/claimStore";
import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import {
	createUserWithEmailAndPassword,
	getAuth,
} from "@react-native-firebase/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Alert,
	ImageSourcePropType,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SibklText from "../../assets/images/sibkl-text-white.png";

type signUpFormData = {
	email: string;
	password: string;
};
const Page = () => {
	const [showPassword, setShowPassword] = useState(false);
	const passwordRef = useRef<TextInput>(null);

	const router = useRouter();
	const { selectedProfile } = useClaimStore();
	const qc = useQueryClient();
	const { full_email, id } = useLocalSearchParams();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<signUpFormData>({
		defaultValues: { email: String(full_email) ?? "", password: "" },
	});

	const createUserAndGoToCompleteProfile = async (personId: number) => {
		const res = await secureFetch(
			apiEndpoints.users.createUserWithExistingPerson,
			{
				method: "POST",
				body: JSON.stringify({
					people_id: personId,
				}),
			},
		);
		const json = await res.json();
		if (json.success) {
			// Call react query here
			await qc.prefetchQuery({
				queryKey: ["person", personId],
				queryFn: () => fetchPersonById(personId),
			});
			router.push("/(auth)/complete-profile");
			return;
		}
	};

	const onSubmit = async (data: signUpFormData) => {
		try {
			const email = data.email.trim();
			const password = data.password.trim();

			if (!email || !password) {
				Alert.alert("Error", "Email and password are required.");
				return;
			}

			await createUserWithEmailAndPassword(getAuth(), email, password);
			await createUserAndGoToCompleteProfile(Number(id));
		} catch (err: any) {
			Alert.alert("Error", err.message || "Failed to create account.");
		}
	};

	return (
		<KeyboardAwareScrollView
			className="flex-1 bg-red-700"
			enableOnAndroid={true}
			extraScrollHeight={5}
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{
				flexGrow: 1,
			}}
		>
			<View className="items-center justify-center mt-16 py-[7rem]">
				<PulsingLogo
					source={SibklText as ImageSourcePropType}
					className="h-18"
				/>
			</View>
			<View className="bg-background py-10 px-6 rounded-t-[30px] h-full">
				<Text className="text-3xl font-bold text-gray-700 mb-2">
					Claim Account
				</Text>
				<Text className="font-regular text-gray-700 mb-8">
					You're almost there! Enter your new password to claim your
					account.
				</Text>

				<View className="gap-y-6">
					{/* Email input */}
					<View className="ml-[-2px]">
						<FormField
							name="email"
							label="Claim Email (Verified)"
							control={control}
							errors={errors}
							disabled
							icon={<Mail size={20} color="#6b7280" />}
						/>
					</View>

					{/* Password input */}
					<View className="ml-[-2px]">
						<FormField
							name="password"
							label="Set Password"
							placeholder="New Password"
							ref={passwordRef}
							control={control}
							errors={errors}
							rules={{
								required: "Password is required",
								minLength: 6,
							}}
							secureTextEntry={!showPassword}
							icon={<Lock size={20} color="#6b7280" />}
							rightIcon={
								<TouchableOpacity
									onPress={() =>
										setShowPassword(!showPassword)
									}
								>
									{showPassword ? (
										<Eye size={20} color="#9ca3af" />
									) : (
										<EyeOff size={20} color="#9ca3af" />
									)}
								</TouchableOpacity>
							}
						/>
					</View>

					{/* Submit */}
					<TouchableOpacity
						className={`w-full py-4 rounded-[15px] items-center justify-center mt-6 bg-primary-600`}
						onPress={handleSubmit(onSubmit)}
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<ActivityIndicator color="white" />
						) : (
							<Text className="text-lg text-white font-bold">
								Create Account
							</Text>
						)}
					</TouchableOpacity>

					{/* Sign in link */}
					<View className="items-center">
						<Text className="font-regular text-gray-600 text-sm">
							Already have an account?{" "}
							<Link href="/sign-in" asChild>
								<Text className="text-primary-600 font-semibold">
									Sign In
								</Text>
							</Link>
						</Text>
					</View>
				</View>
			</View>
		</KeyboardAwareScrollView>
	);
};

export default Page;
