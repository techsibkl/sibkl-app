import { Platform } from "react-native";

// constants/formStyles.ts
export const formStyles = {
	inputSelect:
		"w-full font-regular px-4 text-start bg-white border border-border rounded-[15px]",
	inputDate:
		"w-full p-4 text-start bg-white border border-border rounded-[15px]",
	inputText:
		"w-full px-4 py-3 text-start text-gray-600 bg-white border border-border rounded-[15px]",
};

// Android TextInput ignores padding from className — use style prop directly
export const inputPaddingComfort =
	Platform.OS === "android"
		? { paddingVertical: 12 }
		: { paddingVertical: 18 };

export const inputPadding =
	Platform.OS === "android"
		? { paddingVertical: 8 }
		: { paddingVertical: 14 };
