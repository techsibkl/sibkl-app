import {
	FileIcon,
	FolderIcon,
	ImageIcon,
	PlayCircleIcon,
} from "lucide-react-native";
import React from "react";

export const getIcon = (type?: string, color: string = "#9CA3AF") => {
	switch (type) {
		case "Video":
			return <PlayCircleIcon size={22} color={color} />;
		case "PDF":
			return <FileIcon size={22} color={color} />;
		case "Image":
			return <ImageIcon size={22} color={color} />;
		case "Folder":
			return <FolderIcon size={22} color={color} />;
		default:
			return <FileIcon size={22} color={color} />;
	}
};

export const getColor = (type?: string) => {
	switch (type) {
		case "Video":
			return "#3B82F6"; // blue-500
		case "PDF":
			return "#EF4444"; // red-500
		case "Image":
			return "#6B7280"; // gray-500
		case "Folder":
			return "#111827"; // gray-900
		default:
			return "#9CA3AF"; // gray-400
	}
};
