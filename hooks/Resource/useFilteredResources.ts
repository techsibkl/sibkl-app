import { CATEGORIES } from "@/constants/const_resources";
import { MediaResource } from "@/services/Resource/resource.type";
import { useMemo } from "react";

export const useFilteredResources = (
	resources: MediaResource[] | undefined,
	searchQuery: string,
	sortAsc: boolean = false
) => {
	return useMemo(() => {
		if (!resources) return [];

		// Filter
		const filtered = resources.filter((r) =>
			r.title.toLowerCase().includes(searchQuery.toLowerCase())
		);

		// Sort by upload_date (assuming it's a string or Date)
		const sorted = [...filtered].sort((a, b) => {
			const dateA = new Date(a.upload_date ?? 0).getTime();
			const dateB = new Date(b.upload_date ?? 0).getTime();
			return sortAsc ? dateA - dateB : dateB - dateA;
		});

		// Group by categories
		return CATEGORIES.map((category) => ({
			category,
			items: sorted.filter((r) => r.category === category),
		}));
	}, [resources, searchQuery, sortAsc]);
};
