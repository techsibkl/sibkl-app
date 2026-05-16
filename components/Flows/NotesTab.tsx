import NoteItem from "@/components/Notes/NoteItem";
import { useNotesByPersonQuery } from "@/hooks/Note/useNotesQuery";
import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { createNote, deleteNote } from "@/services/Note/notes.service";
import { useQueryClient } from "@tanstack/react-query";
import { SendIcon } from "lucide-react-native";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

type NotesTabProps = {
	personFlow: PeopleFlow;
};

const NotesTab = ({ personFlow }: NotesTabProps) => {
	const personId = Number(personFlow.p__id);
	const queryClient = useQueryClient();
	const { data: notes = [], isLoading } = useNotesByPersonQuery(personId);
	const [newNote, setNewNote] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const invalidateNotes = () => {
		queryClient.invalidateQueries({ queryKey: ["notes", personId] });
	};

	const handleCreateNote = async () => {
		if (!newNote.trim()) {
			Alert.alert("Error", "Please enter a note");
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await createNote(
				personId,
				newNote.trim(),
				personFlow.p__district_ids,
			);

			if (result.success) {
				setNewNote("");
				invalidateNotes();
			} else {
				Alert.alert("Error", result.message || "Failed to create note");
			}
		} catch (error) {
			console.error("Error creating note:", error);
			Alert.alert("Error", "Failed to create note");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteNote = async (noteId: string) => {
		Alert.alert(
			"Delete Note",
			"Are you sure you want to delete this note?",
			[
				{
					text: "Cancel",
					onPress: () => {},
					style: "cancel",
				},
				{
					text: "Delete",
					onPress: async () => {
						try {
							const result = await deleteNote(noteId);
							if (result.success) {
								invalidateNotes();
								Alert.alert(
									"Success",
									"Note deleted successfully",
								);
							} else {
								Alert.alert(
									"Error",
									result.message || "Failed to delete note",
								);
							}
						} catch (error) {
							console.error("Error deleting note:", error);
							Alert.alert("Error", "Failed to delete note");
						}
					},
					style: "destructive",
				},
			],
		);
	};

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center py-10">
				<ActivityIndicator size="large" color="#3b82f6" />
			</View>
		);
	}

	return (
		<ScrollView
			className="flex-1 w-full px-6 py-4"
			contentContainerStyle={{
				paddingBottom: 20,
			}}
			showsVerticalScrollIndicator={false}
		>
			{/* Create Note Input */}
			<View className="mb-4 gap-2">
				<View className="flex-row gap-2">
					<TextInput
						className="flex-1 border border-border rounded-lg px-3 py-2 text-gray-900 text-sm"
						placeholder="Add a new note here..."
						value={newNote}
						onChangeText={setNewNote}
						multiline
						editable={!isSubmitting}
						placeholderTextColor="#9ca3af"
					/>
					<TouchableOpacity
						className="px-3 py-2 bg-blue-600 rounded-lg items-center justify-center"
						onPress={handleCreateNote}
						disabled={isSubmitting || !newNote.trim()}
					>
						{isSubmitting ? (
							<ActivityIndicator size="small" color="white" />
						) : (
							<SendIcon size={14} color="white" />
						)}
					</TouchableOpacity>
				</View>
			</View>

			{/* Notes List */}
			<View className="gap-3 ">
				{notes.length === 0 ? (
					<View className="items-center justify-center py-8">
						<Text className="text-gray-400 text-sm">
							No notes yet for this person.
						</Text>
					</View>
				) : (
					notes.map((note) => (
						<NoteItem
							key={note.id}
							note={note}
							onDelete={handleDeleteNote}
						/>
					))
				)}
			</View>
		</ScrollView>
	);
};

export default NotesTab;
