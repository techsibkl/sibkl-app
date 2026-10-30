import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";

/**
 * Send OTP via Twilio Verify SMS to the phone number on the person record.
 * Used for claim-account-by-phone flow.
 */
export const sendSmsOTP = async (personId: number): Promise<ReturnVal> => {
	try {
		const response = await secureFetch(
			apiEndpoints.otp.sendSms,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ person_id: personId }),
			},
			{ allowUnauthenticated: true }
		);
		return response.json();
	} catch (error) {
		console.error("sendSmsOTP error:", error);
		return { success: false, message: "Failed to send SMS OTP." };
	}
};

/**
 * Verify the SMS OTP code via Twilio Verify.
 * Returns { success, data: { email } } on success so the app can create a Firebase account.
 */
export const verifySmsOTP = async (
	personId: number,
	otpCode: string
): Promise<ReturnVal> => {
	try {
		const response = await secureFetch(
			apiEndpoints.otp.verifySms,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ person_id: personId, otpCode }),
			},
			{ allowUnauthenticated: true }
		);
		return response.json();
	} catch (error) {
		console.error("verifySmsOTP error:", error);
		return { success: false, message: "Failed to verify SMS OTP." };
	}
};

export const sendOTP = async (
	personid: number | null,
	email: string | null
) => {
	try {
		let payload = {};
		if (personid && !email) {
			payload = {
				person_id: personid,
			};
		}
		if (!personid && email) {
			payload = {
				email: email,
			};
		}

		const response = await secureFetch(
			`${apiEndpoints.otp.create}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			},
			{ allowUnauthenticated: true }
		);
		const json = await response.json();
		return json;
	} catch (error) {
		console.error(error);
	}
};

export const verifyOTP = async (
	personid: number | null,
	email: string | null,
	otpCode: string
): Promise<ReturnVal> => {
	try {
		let payload = {};
		if (personid && !email) {
			payload = {
				person_id: personid,
				otpCode: otpCode,
			};
		}
		if (!personid && email) {
			payload = {
				email: email,
				otpCode: otpCode,
			};
		}

		const response = await secureFetch(
			`${apiEndpoints.otp.verify}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			},
			{ allowUnauthenticated: true }
		);
		const json = await response.json();
		return json;
	} catch (error) {
		console.error(error);
		return {
			success: false,
			message: "Internal Server Error. Verification failed.",
		};
	}
};
