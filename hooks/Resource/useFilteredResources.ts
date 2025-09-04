import { CATEGORIES } from "@/constants/const_resources";
import { MediaResource } from "@/services/Resource/resource.type";
import { useMemo } from "react";

export function useFilteredResources(
  resources: MediaResource[] | undefined,
  searchQuery: string
) {
  return useMemo(() => {
    if (!resources) return [];

    // Filter
    const filtered = resources.filter((r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by categories
    return CATEGORIES.map((category) => ({
      category,
      items: filtered.filter((r) => r.category === category),
    }));
  }, [resources, searchQuery]);
}
