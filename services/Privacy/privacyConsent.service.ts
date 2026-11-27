import { PRIVACY_POLICY_VERSION } from "@/constants/privacyPolicy";
import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";

export type PrivacyConsentStatus = {
	policy_version: string;
	accepted: boolean;
	email: string | null;
	consented_at: string | null;
	email_sent?: boolean;
};

const readConsent = async (response: Response): Promise<PrivacyConsentStatus> => {
	const json: ReturnVal = await response.json();
	if (!response.ok || !json.success || !json.data) {
		throw new Error(json.message || "Could not record privacy consent");
	}
	return {
		policy_version: String(json.data.policy_version ?? PRIVACY_POLICY_VERSION),
		accepted: json.data.accepted === true,
		email: typeof json.data.email === "string" ? json.data.email : null,
		consented_at:
			typeof json.data.consented_at === "string" ? json.data.consented_at : null,
		email_sent: json.data.email_sent === true,
	};
};

export const fetchPrivacyConsentStatus = async (): Promise<PrivacyConsentStatus> => {
	const response = await secureFetch(
		apiEndpoints.users.privacyConsent,
		{ method: "GET" },
		{ skipPersonSync: true },
	);
	return readConsent(response);
};

export const grantPrivacyConsent = async (platform: string): Promise<PrivacyConsentStatus> => {
	const response = await secureFetch(
		apiEndpoints.users.privacyConsent,
		{
			method: "POST",
			body: JSON.stringify({
				policy_version: PRIVACY_POLICY_VERSION,
				allow_admin_management: true,
				allow_retention_migration: true,
				platform,
			}),
		},
		{ skipPersonSync: true },
	);
	return readConsent(response);
};

export const withdrawPrivacyConsent = async (): Promise<void> => {
	const response = await secureFetch(
		apiEndpoints.users.privacyConsentWithdraw,
		{ method: "POST" },
		{ skipPersonSync: true },
	);
	const json: ReturnVal = await response.json();
	if (!response.ok || !json.success) {
		throw new Error(json.message || "Could not withdraw privacy consent");
	}
};
