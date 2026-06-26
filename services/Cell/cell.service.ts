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
  export type CellMemberAction = "approve" | "reject";

  const getMemberAction = (status: CellMemberStatusAction): CellMemberAction => {
    const actionMap: Record<CellMemberStatusAction, CellMemberAction> = {
      "ACTIVE": "approve",
      "REJECTED": "reject",
      "PENDING": "approve"
    };
    return actionMap[status];
  };

  export const updateMemberStatus = async (
    cellId: number,
    personId: number,
    status: CellMemberStatusAction
  ) => {
    const apiAction = getMemberAction(status);
    const response = await secureFetch(`${apiEndpoints.cells.updateMemberStatus(cellId)}`, { 
      method: "PUT",
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ person_id: personId, action: apiAction }) },
    );
    const json: ReturnVal = await response.json();
    if (!json.success) {
      throw { 
        status: json.status_code,
        message: json.message };
    }
    return json.data;
  };
  