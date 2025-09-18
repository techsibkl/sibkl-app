import { apiEndpoints } from "@/utils/endpoints";
import { formatObjStrToDate } from "@/utils/helper";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";
import { Cell } from "../Cell/cell.types";
import { District } from "../District/district.types";
import { Person, maskedPerson } from "./person.type";

export async function fetchPeople(id: number | void): Promise<Person[]> {
  // Fetch data from the server
  let url = id
    ? `${apiEndpoints.people.getById(id)}`
    : `${apiEndpoints.people.getAll}`;
  let response = await secureFetch(url);
  let json: ReturnVal = await response.json();
  if (!json.success) {
    throw {
      status: json.status_code,
      message: json.message,
    };
  }
  let result = json.data?.map((item: any) => ({
    ...formatObjStrToDate(item),
    f_cell_names: (item["cells"] as Cell[]).map((cell) => cell.cell_name),
    f_district_names: (item["districts"] as District[]).map(
      (district) => district.name
    ),
  }));
  return result;
}

export async function fetchPeopleWithNoUid(): Promise<maskedPerson[] | null> {
  // Fetch data from the server
  try {
    console.log(apiEndpoints.people.geteWithNoUid);
    let response = await secureFetch(
      apiEndpoints.people.geteWithNoUid,
      { method: "GET" },
      { allowUnauthenticated: true }
    );
    console.log("response:", response);
    let json: ReturnVal = await response.json();
    console.log(json);
    if (!json.success) {
      throw {
        status: json.status_code,
        message: json.message,
      };
    }

    return json?.data as maskedPerson[];
  } catch (error) {
    console.error(error);
    return null;
  }
}
