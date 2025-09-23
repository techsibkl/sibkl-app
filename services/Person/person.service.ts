import { apiEndpoints } from "@/utils/endpoints";
import { dateReplacer, formatObjStrToDate } from "@/utils/helper";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";
import { Cell } from "../Cell/cell.types";
import { District } from "../District/district.types";
import { MaskedPerson, Person } from "./person.type";

export const fetchPeople = async (id: number | void): Promise<Person[]> => {
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
};

export const fetchPeopleWithNoUid = async (): Promise<
  MaskedPerson[] | null
> => {
  // Fetch data from the server
  try {
    let response = await secureFetch(
      apiEndpoints.people.geteWithNoUid,
      { method: "GET" },
      { allowUnauthenticated: true }
    );
    let json: ReturnVal = await response.json();
    if (!json.success) {
      throw {
        status: json.status_code,
        message: json.message,
      };
    }

    return json?.data as MaskedPerson[];
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updatePeople = async (
  person: Partial<Person>
): Promise<ReturnVal> => {
  let response = await secureFetch(
    `${apiEndpoints.people.update(person.id!)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(person, dateReplacer),
    }
  );

  let data = await response.json();
  return data;
};
