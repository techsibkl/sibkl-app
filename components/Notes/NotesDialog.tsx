import { PeopleFlow } from "@/services/Flow/peopleFlow.type";
import { createNote } from "@/services/Note/notes.service";
import { myToast } from "@/utils/helper";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import SharedButton from "../shared/SharedButton";

type AddNoteDialogProps = {
	visible?: boolean;
	onDismiss: () => void;
	personFlow: PeopleFlow;
};

const AddNoteDialog = ({
	visible,
	onDismiss,
	personFlow,
}: AddNoteDialogProps) => {
	const [note, setNote] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSave = async () => {
		setIsLoading(true);
		const res = await createNote(
			personFlow.people_id!,
			note,
			personFlow.p__district_ids
		);
		if (res.success) {
			setIsLoading(false);
			setNote("");
			onDismiss();
		}
		Toast.show(myToast(res));
	};

	return (
		<View
			className="flex-col bg-white rounded-[15px] overflow-hidden items-center justify-start"
			style={{
				shadowRadius: 5, // Override the default blur
				shadowOpacity: 0.05,
			}}
		>
			<View className="bg-white rounded-lg p-6 w-full max-w-md">
				<Text className="text-xl font-bold text-gray-800 mb-4">
					{`Add note for '${personFlow.p__full_name}'`}
				</Text>

				<TextInput
					className="border border-gray-300 rounded-lg p-3 mb-4 min-h-[120px] text-gray-800"
					placeholder="Enter your note here..."
					placeholderTextColor="#9CA3AF"
					multiline
					numberOfLines={5}
					textAlignVertical="top"
					value={note}
					onChangeText={setNote}
					submitBehavior="blurAndSubmit"
				/>

				<View className="flex-row justify-end gap-2">
					<SharedButton
						onPress={onDismiss}
						title="Cancel"
						variant="outline"
					/>

					<SharedButton
						onPress={handleSave}
						title="Save"
						variant="primary"
						isLoading={isLoading}
					/>
				</View>
			</View>
		</View>
	);
};

export default AddNoteDialog;
