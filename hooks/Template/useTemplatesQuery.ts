import {
  getTemplateById,
  getTemplates,
} from "@/services/Template/template.service";
import { MyTemplate } from "@/utils/types/Template.type";
import { useQuery } from "@tanstack/react-query";

export const useTemplatesQuery = () => {
	return useQuery<MyTemplate[]>({
		queryKey: ["templates"],
		queryFn: getTemplates,
	});
};

export const useTemplateByIdQuery = (id: number) => {
	return useQuery<MyTemplate>({
		queryKey: ["templates", id],
		queryFn: () => getTemplateById(id),
	});
};
