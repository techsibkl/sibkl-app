import { fetchPeopleWithNoUid } from "@/services/Person/person.service";
import { MaskedPerson } from "@/services/Person/person.type";
import { useQuery } from "@tanstack/react-query";

export const usePeopleWithNouidQuery = () => {
	return useQuery<MaskedPerson[] | null>({
		queryKey: ["maskedPeople"],
		queryFn: () => fetchPeopleWithNoUid(),
	});
};
