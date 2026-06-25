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

  export const fetchCellsPublic = async (): Promise<Cell[]> => {
    const response = await secureFetch(`${apiEndpoints.cells.getCellsPublic}`);
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

  export const joinCell = async (cellId: number): Promise<void> => {
    const response = await secureFetch(`${apiEndpoints.cells.joinCell(cellId)}`, {
      method: 'POST',
    });
    const json: ReturnVal = await response.json();
    if (!json.success) {
      throw {
        status: json.status_code,
        message: json.message
      };
    }
  };

  export type CellMemberStatusAction = "ACTIVE" | "PENDING" | "REJECTED";
  
  export const updateMemberStatus = async (
    cellId: number,
    personId: number,
    action: CellMemberStatusAction
  ) => {
    const response = await fetch(
      `/api/cells/${cellId}/member-status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          person_id: personId,
          action,
        }),
      }
    );
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || "Failed to update member status");
    }
  
    return response.json();
  };
  