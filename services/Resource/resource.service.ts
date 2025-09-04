import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { MediaResource } from "./resource.type";

export const getResources = async (): Promise<MediaResource[]> => {
  const response = await secureFetch(`${apiEndpoints.resources.getAll}`);
  const json = await response.json();
  return json.data as MediaResource[];
};

const PAGE_SIZE = 20;
export const getCategoryResources = async (
  category: string,
  pageParam: number = 1
): Promise<{
  items: MediaResource[];
  nextPage?: number;
}> => {
  const response = await secureFetch(
    `${apiEndpoints.resources.getAll}?category=${category}&page=${pageParam}&limit=${PAGE_SIZE}`
  );
  const data = await response.json();

  return {
    items: data.data,
    nextPage: data.data.length === PAGE_SIZE ? pageParam + 1 : undefined,
  };
};
