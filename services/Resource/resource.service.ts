import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { MediaResource } from "./resource.type";

export const getResources = async (): Promise<MediaResource[]> => {
  const response = await secureFetch(`${apiEndpoints.resources.getAll}`);
  const json = await response.json();
  return json.data as MediaResource[];
};