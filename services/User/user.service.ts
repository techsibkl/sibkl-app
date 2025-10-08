import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";

export const updateDeviceToken = async (
	uid: string,
	deviceToken: string
): Promise<ReturnVal> => {
	const payload = {
		uid,
		deviceToken,
	};
	const response = await secureFetch(
		`${apiEndpoints.users.updateDeviceToken}`,
		{
			method: "PUT",
			body: JSON.stringify(payload),
		}
	);
	const json: ReturnVal = await response.json();
	return json;
};
