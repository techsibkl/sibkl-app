import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";

export type OtpChannel = "email" | "sms";

/**
 * Sends an OTP via the given channel.
 * - `personid` only: backend resolves email (email) or phone (sms) from the person record.
 * - `email` only: email channel, no person lookup needed.
 */
export const sendOTP = async (
	personid: number | null,
	email: string | null,
	channel: OtpChannel = "email",
) => {
	try {
		const payload: Record<string, unknown> = { channel };
		if (personid != null) payload.person_id = personid;
		if (email?.trim()) payload.email = email.trim();

		const response = await secureFetch(
			`${apiEndpoints.otp.create}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			},
			{ allowUnauthenticated: true },
		);
		return await response.json();
	} catch (error) {
		console.error(error);
	}
};

/**
 * Verifies an OTP code.
 * Always sends every available identifier; the backend matches on
 * (email = ? OR phone = ?) derived from the person record or direct params.
 */
export const verifyOTP = async (
	personid: number | null,
	email: string | null,
	otpCode: string,
): Promise<ReturnVal> => {
	try {
		const payload: Record<string, unknown> = { otpCode };
		if (personid != null) payload.person_id = personid;
		if (email?.trim()) payload.email = email.trim();

		const response = await secureFetch(
			`${apiEndpoints.otp.verify}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			},
			{ allowUnauthenticated: true },
		);
		return await response.json();
	} catch (error) {
		console.error(error);
		return {
			success: false,
			message: "Internal Server Error. Verification failed.",
		};
	}
};
