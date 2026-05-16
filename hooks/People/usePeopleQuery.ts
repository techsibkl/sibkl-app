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
			const { page, pageSize, total, totalPages } = lastPage.meta;
			const lastPageNumber =
				typeof totalPages === "number" && totalPages > 0
					? totalPages
					: typeof total === "number" &&
						  typeof pageSize === "number" &&
						  pageSize > 0
						? Math.ceil(total / pageSize)
						: undefined;
			if (typeof page !== "number" || lastPageNumber === undefined) {
				return undefined;
			}
			return page < lastPageNumber ? page + 1 : undefined;
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
