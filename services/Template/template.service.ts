// export const createTemplate = async (data: MyTemplate): Promise<ReturnVal> => {
//   const api = useApiEndpoints();
//   const response = await secureFetch(`${api.Templates.create}`, {
//     method: "POST",
//     body: JSON.stringify(data, dateReplacer)
//   });
//   const json = await response.json();
//   return json;
// };

import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { MyTemplate } from "@/utils/types/Template.type";

export const getTemplates = async (): Promise<MyTemplate[]> => {
	const response = await secureFetch(`${apiEndpoints.templates.getAll}`);
	const json = await response.json();
	return json.data;
};

export const getTemplateById = async (id: number): Promise<MyTemplate> => {
	const response = await secureFetch(`${apiEndpoints.templates.getById(id)}`);
	const json = await response.json();
	return json.data[0];
};

// // Update Template by ID
// export const updateTemplate = async (id: number, data: Announcement): Promise<ReturnVal> => {
//   const api = useApiEndpoints();
//   const response = await secureFetch(`${api.announcements.update(id)}`, {
//     method: "PUT",
//     body: JSON.stringify(data, dateReplacer)
//   });
//   const json = await response.json();
//   return json;
// };
