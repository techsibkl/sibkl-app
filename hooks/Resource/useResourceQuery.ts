import { getResources } from "@/services/Resource/resource.service";
import { MediaResource } from "@/services/Resource/resource.type";
import { useQuery } from "@tanstack/react-query";

export const useResourcesQuery = () => {
  return useQuery<MediaResource[]>({
    queryKey: ["resources"],
    queryFn: getResources,
  });
};
