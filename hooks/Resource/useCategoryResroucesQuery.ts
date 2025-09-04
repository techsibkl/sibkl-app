import { getCategoryResources } from "@/services/Resource/resource.service";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useCategorResourceQuery = (category: string) => {
  return useInfiniteQuery({
    queryKey: ["resources", category],
    queryFn: ({ pageParam }) => getCategoryResources(category, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};
