import { suggestUnclaimedPeople } from "@/services/Person/person.service";
import { UnclaimedSuggestion } from "@/services/Person/person.type";
import { useMutation } from "@tanstack/react-query";

type SuggestError = {
	status?: number;
	message?: string;
	err_code?: string;
};

export const useSuggestUnclaimedMutation = () => {
	return useMutation<UnclaimedSuggestion[], SuggestError, string>({
		mutationFn: (claimToken) => suggestUnclaimedPeople(claimToken),
	});
};
