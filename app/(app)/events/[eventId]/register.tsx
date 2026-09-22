import EventCustomFieldsSection from "@/components/Events/EventCustomFieldsSection";
import EventRegistrationClosed from "@/components/Events/EventRegistrationClosed";
import EventRegistrationHeader from "@/components/Events/EventRegistrationHeader";
import ParticipantContactFields from "@/components/Events/ParticipantContactFields";
import SharedBody from "@/components/shared/SharedBody";
import SharedButton from "@/components/shared/SharedButton";
import SkeletonList from "@/components/shared/Skeleton/SkeletonList";
import { useEventQuery } from "@/hooks/Event/useEventQuery";
import { useEventRegistrationMutation } from "@/hooks/Event/useEventRegistrationMutation";
import {
	EventRegistrationFormValues,
	PARTICIPANT_ALREADY_REGISTERED,
} from "@/services/Event/event.type";
import { useAuthStore } from "@/stores/authStore";
import {
	buildRegistrationDefaultValues,
	formatMetadataForSubmit,
} from "@/utils/eventFormHelpers";
import {
	getRegistrationClosedMessage,
	isEventRegisterable,
} from "@/utils/eventRegistrationGates";
import {
	hasValidationErrors,
	validateEventRegistrationForm,
} from "@/utils/eventRegistrationValidation";
import { myToast } from "@/utils/helper";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";

const EventRegisterScreen = () => {
	const { eventId } = useLocalSearchParams<{ eventId: string }>();
	const router = useRouter();
	const { user, isGuest } = useAuthStore();
	const person = user?.person;

	const {
		data: event,
		isPending,
		isError,
		error: fetchError,
	} = useEventQuery(eventId);

	const mutation = useEventRegistrationMutation(eventId ?? "");
	const [submitError, setSubmitError] = useState<string | null>(null);

	const defaultValues = useMemo(
		() => buildRegistrationDefaultValues(person, event?.custom_fields),
		[person, event?.custom_fields],
	);

	const {
		control,
		handleSubmit,
		reset,
		setError,
		formState: { errors },
	} = useForm<EventRegistrationFormValues>({
		defaultValues,
	});

	useEffect(() => {
		if (event) {
			reset(buildRegistrationDefaultValues(person, event.custom_fields));
		}
	}, [event, person, reset]);

	if (isGuest || !person) {
		return <Redirect href="/(auth)/sign-in" />;
	}

	if (isPending) {
		return (
			<SharedBody>
				<SkeletonList length={5} />
			</SharedBody>
		);
	}

	if (isError || !event) {
		return (
			<SharedBody>
				<View className="px-4 pt-8">
					<Text className="text-center text-red-500">
						{(fetchError as any)?.message ??
							"Failed to load event. Please try again."}
					</Text>
				</View>
			</SharedBody>
		);
	}

	const registerable = isEventRegisterable(event);
	const closedMessage = getRegistrationClosedMessage(event);

	const onSubmit = handleSubmit(async (values) => {
		setSubmitError(null);

		const validationErrors = validateEventRegistrationForm(values);
		if (validationErrors.full_name) {
			setError("full_name", { message: validationErrors.full_name });
		}
		if (validationErrors.email) {
			setError("email", { message: validationErrors.email });
		}
		if (hasValidationErrors(validationErrors)) {
			return;
		}

		const phone = values.phone?.trim();
		const email = values.email?.trim();

		try {
			await mutation.mutateAsync({
				person_id: String(person.id),
				full_name: values.full_name.trim(),
				...(email ? { email } : {}),
				...(phone ? { phone } : {}),
				rsvp: true,
				metadata: formatMetadataForSubmit(
					values.metadata ?? {},
					event.custom_fields ?? [],
				),
			});

			router.replace({
				pathname: "/(app)/events/[eventId]/confirmation",
				params: { eventId: String(eventId) },
			});
		} catch (err: any) {
			const message =
				err?.message ?? "Registration failed. Please try again.";
			setSubmitError(message);

			if (err?.err_code !== PARTICIPANT_ALREADY_REGISTERED) {
				Toast.show(
					myToast({
						success: false,
						message,
					}),
				);
			}
		}
	});

	return (
		<SharedBody>
			<KeyboardAwareScrollView
				className="flex-1 bg-background"
				enableOnAndroid
				extraScrollHeight={80}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{
					padding: 16,
					paddingBottom: 40,
					gap: 20,
				}}
			>
				<EventRegistrationHeader event={event} />

				{!registerable ? (
					<EventRegistrationClosed message={closedMessage} />
				) : (
					<>
						{submitError && (
							<View className="bg-red-50 border border-red-200 rounded-2xl p-4">
								<Text className="text-sm text-red-700">
									{submitError}
								</Text>
							</View>
						)}

						<ParticipantContactFields
							control={control}
							errors={errors}
						/>

						<EventCustomFieldsSection
							fields={event.custom_fields}
							control={control}
							errors={errors}
						/>

						<SharedButton
							title="Register"
							onPress={onSubmit}
							isLoading={mutation.isPending}
							disabled={mutation.isPending}
							className="mt-2"
						/>
					</>
				)}
			</KeyboardAwareScrollView>
		</SharedBody>
	);
};

export default EventRegisterScreen;
