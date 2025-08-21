import { fetchPeople } from "@/services/Person/person.service";
import { Person } from "@/services/Person/person.type";
import { useQuery } from "@tanstack/react-query";

export const usePeopleQuery = () => {

  return useQuery<Person[]>({
    queryKey: ["people"],
    queryFn: () => fetchPeople()
  });
};