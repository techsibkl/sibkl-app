import {
	fetchPeople,
	fetchPeopleScopedFields,
	fetchPersonById,
} from "@/services/Person/person.service";
import { Person } from "@/services/Person/person.type";
import { useQuery } from "@tanstack/react-query";

export const usePeopleQuery = () => {
	return useQuery<Person[]>({
		queryKey: ["people"],
		queryFn: () => fetchPeople(),
	});
};

export const useSinglePersonQuery = (personId: number) => {
	return useQuery<Person>({
		queryKey: ["people", personId],
		queryFn: async () => {
			const res = await fetchPersonById(personId);
			return res;
		},
		retry: (failureCount, error: any) => {
			if (error?.status === 401 || error?.status === 403) {
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
