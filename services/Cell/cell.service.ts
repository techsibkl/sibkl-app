import { apiEndpoints } from "@/utils/endpoints";
import { formatObjStrToDate } from "@/utils/helper";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";
import { Cell } from "./cell.types";

  export const fetchCells = async (): Promise<Cell[]> => {
    const response = await secureFetch(`${apiEndpoints.cells.getAll}`);
    const json: ReturnVal = await response.json();
    return json.data as Cell[];
  };

  export const fetchSingleCell = async (id: number) => {
    const response = await secureFetch(`${apiEndpoints.cells.getById(id)}`);
    const json: ReturnVal = await response.json();
    if (!json.success) {
      throw {
        status: json.status_code,
        message: json.message
      };
    }
    const data = json.data;
    const result = data?.map((item: any) => ({
      ...formatObjStrToDate(item)
    }));
    return result;
  };
