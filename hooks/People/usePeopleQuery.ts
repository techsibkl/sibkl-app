import {
	fetchPeople,
	fetchPeoplePaginated,
	fetchPeopleScopedFields,
	fetchPersonById,
} from "@/services/Person/person.service";
import { Person } from "@/services/Person/person.type";
import { PeoplePaginatedParams } from "@/types/PeoplePaginated.type";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const usePeopleQuery = () => {
	return useQuery<Person[]>({
		queryKey: ["people"],
		queryFn: () => fetchPeople(),
	});
};

export const usePeoplePaginatedQuery = (
	params: Omit<PeoplePaginatedParams, "page"> = {},
) => {
	const query = useInfiniteQuery({
		queryKey: ["people_paginated", params],
		queryFn: ({ pageParam = 1 }) =>
			fetchPeoplePaginated({ ...params, page: pageParam }),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const meta = lastPage.meta;
			if (meta == null || meta.page == null) return undefined;

			// Prefer totalPages — `total` is the total row count, not the last page index.
			// Comparing page to row count would keep hasNextPage true until page exceeds
			// the number of people (hundreds of redundant fetches).
			if (typeof meta.totalPages === "number" && meta.totalPages > 0) {
				return meta.page < meta.totalPages ? meta.page + 1 : undefined;
			}

			if (
				typeof meta.total === "number" &&
				meta.total > 0 &&
				typeof meta.pageSize === "number" &&
				meta.pageSize > 0
			) {
				return meta.page * meta.pageSize < meta.total
					? meta.page + 1
					: undefined;
			}

			return undefined;
		},
	});

	// Flatten all pages into a single array
	const people: Person[] = useMemo(
		() => query.data?.pages.flatMap((p) => p.data) ?? [],
		[query.data],
	);

	const meta = query.data?.pages.at(-1)?.meta;

	return {
		...query,
		people,
		meta,
		loadMore: query.fetchNextPage,
		isLoadingMore: query.isFetchingNextPage,
		hasMore: query.hasNextPage,
	};
};

export const useSinglePersonQuery = (personId: number) => {
	return useQuery<Person>({
		queryKey: ["people", personId],
		queryFn: async () => {
			const res = await fetchPersonById(personId);
			return res;
		},
		retry: (failureCount, error: any) => {
			if (
				error?.status === 401 ||
				error?.status === 403 ||
				error?.status === 404
			) {
				return false;
			}
			return failureCount < 3;
		},
	});
};

export const usePeopleScopedFieldsQuery = () => {
	return useQuery<Person[]>({
		queryKey: ["people_scoped"],
		queryFn: () => fetchPeopleScopedFields(),
		// Don't refetch on window focus — table state is user-driven
		refetchOnWindowFocus: false,
		// Keep previous page data visible while next page loads (no flicker)
		placeholderData: (prev) => prev,
	});
};
