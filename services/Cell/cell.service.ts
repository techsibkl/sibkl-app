import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";
import { Cell } from "./cell.types";

  export const fetchCells = async (): Promise<Cell[]> => {
    const response = await secureFetch(`${apiEndpoints.cells.getAll}`);
    const json: ReturnVal = await response.json();
    return json.data as Cell[];
  };
