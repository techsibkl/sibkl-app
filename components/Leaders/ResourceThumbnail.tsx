import { MediaResource } from "@/services/Resource/resource.type";
import React from "react";
import { Image, ImageStyle, StyleProp, Text, View } from "react-native";
import { getThumbnail } from "./resourcePreview";
import { useVimeoThumbnail } from "./useVimeoThumbnail";

type ResourceThumbnailProps = {
	resource: MediaResource;
	className?: string;
	style?: StyleProp<ImageStyle>;
};

const ResourceThumbnail = ({
	resource,
	className,
	style,
}: ResourceThumbnailProps) => {
	const stored = getThumbnail(resource);
	const needsLookup = !stored && !!resource.vimeo_link;
	const { url, pending } = useVimeoThumbnail(
		needsLookup ? resource.vimeo_link : null,
	);
	const uri = stored ?? url;

	if (!uri) {
		return (
			<View
				className={`bg-gray-100 items-center justify-center ${className ?? ""}`}
				style={style}
			>
				{!pending && (
					<Text className="text-gray-400 text-xs">No Preview</Text>
				)}
			</View>
		);
	}

	return (
		<Image
			source={{ uri }}
			className={className}
			style={style}
			resizeMode="cover"
		/>
	);
};

export default ResourceThumbnail;
