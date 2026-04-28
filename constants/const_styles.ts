import { DefaultTheme } from "@react-navigation/native";
import { Platform } from "react-native";
import { MD3LightTheme } from "react-native-paper";
import { Colors } from "./Colors";

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

// Custom light theme using your brand colors
export const customLightTheme = {
	...MD3LightTheme,
	colors: {
		...MD3LightTheme.colors,
		primary: Colors.primary[500],
		secondary: Colors.secondary[500],
		tertiary: Colors.secondary[600],
		surfaceVariant: Colors.background.secondary,
		background: Colors.background.light,
		surface: Colors.card.light,
		onBackground: Colors.text.light.primary,
		onSurface: Colors.text.light.primary,
		outline: Colors.border.light.primary,
		error: Colors.error,
		success: Colors.success,
	},
};

// Custom navigation theme aligned with your brand
export const customNavigationTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: Colors.primary[500],
		background: Colors.background.light,
		card: Colors.card.light,
		text: Colors.text.light.primary,
		border: Colors.border.light.primary,
		notification: Colors.error,
	},
};
