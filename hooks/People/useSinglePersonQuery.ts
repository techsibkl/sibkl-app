import { fetchPeople } from "@/services/Person/person.service";
import { Person } from "@/services/Person/person.type";
import { useQuery } from "@tanstack/react-query";

export const useSinglePersonQuery = (personId: number) => {
  return useQuery<Person>({
    queryKey: ["people", personId],
    queryFn: async () => {
      const res = await fetchPeople(personId);
      return res![0];
    },
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
