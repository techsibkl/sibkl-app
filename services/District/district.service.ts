import { Cell } from "@/services/Cell/cell.types";
import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";
import { District } from "./district.types";

export const fetchDistricts = async (): Promise<District[]> => {
	const response = await secureFetch(`${apiEndpoints.districts.getAll}`);
	const json: ReturnVal = await response.json();
	if (!json.success) {
		throw { status: json.status_code, message: json.message };
	}
	return json.data as District[];
};

export const fetchDistrictCells = async (
	districtId: number,
): Promise<Cell[]> => {
	const response = await secureFetch(
		`${apiEndpoints.districts.getCellsByDistrictId(districtId)}`,
	);
	const json: ReturnVal = await response.json();
	if (!json.success) {
		throw { status: json.status_code, message: json.message };
	}
	return json.data as Cell[];
};
