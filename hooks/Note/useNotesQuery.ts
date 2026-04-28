import { fetchNotes } from "@/services/Note/notes.service";
import { Note } from "@/services/Note/note.type";
import { useQuery } from "@tanstack/react-query";

export const useNotesByPersonQuery = (personId: number) => {
	return useQuery<Note[]>({
		queryKey: ["notes", personId],
		queryFn: () => fetchNotes(personId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
	});
};
