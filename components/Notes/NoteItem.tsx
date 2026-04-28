import { useAbility } from "@/hooks/useAbility";
import { Note } from "@/services/Note/note.type";
import { displayDateAsStr } from "@/utils/helper";
import { subject } from "@casl/ability";
import { TrashIcon } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type NoteItemProps = {
	note: Note;
	onDelete: (noteId: string) => void;
};

const NoteItem = ({ note, onDelete }: NoteItemProps) => {
	const { can } = useAbility();
	const canDelete = can(
		"delete",
		subject("PeopleProfileNotes", { owner_id: note.owner_id }),
	);
	return (
		<View className="rounded-lg p-3 py-4 border-l-4 border-blue-500 bg-card shadow-sm">
			<View className="flex-row justify-between items-start gap-2">
				<View className="flex-1">
					<Text className="text-xs text-gray-400 mb-2">
						{note.owner_name} ·{" "}
						{note.updated_at
							? displayDateAsStr(note.updated_at)
							: displayDateAsStr(note.created_at)}
					</Text>
					<Text className="text-gray-800 text-sm leading-5">
						{note.note}
					</Text>
				</View>
				{canDelete && (
					<TouchableOpacity
						className="p-1"
						onPress={() => onDelete(note.id)}
						disabled={!canDelete}
					>
						<TrashIcon size={16} color="#ef4444" />
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

export default NoteItem;
