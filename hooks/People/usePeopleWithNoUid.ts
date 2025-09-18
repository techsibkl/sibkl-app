import { fetchPeopleWithNoUid } from "@/services/Person/person.service";
import { maskedPerson } from "@/services/Person/person.type";
import { useQuery } from "@tanstack/react-query";

export const usePeopleWithNouidQuery = () => {
  return useQuery<maskedPerson[] | null>({
    queryKey: ["maskedPeople"],
    queryFn: () => fetchPeopleWithNoUid(),
  });
};
