import { MediaResource } from "@/services/Resource/resource.type";
import { displayDateAsStr } from "@/utils/helper";
import { getColor, getIcon } from "@/utils/helper_leaders";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SharedModal from "../shared/SharedModal";
import ViewResourceDialog from "./ViewResourceDialog";

type SingleFileItemProps = {
	item: MediaResource;
};

const SingleFileItem = ({ item }: SingleFileItemProps) => {
	const [modalVisible, setModalVisible] = useState(false);
	return (
		<>
			<TouchableOpacity
				onPress={() => setModalVisible(true)}
				style={styles.itemContainer}
			>
				<View className="flex-row items-center gap-2 py-1 px-8">
					{getIcon(item.file_type, getColor(item.file_type))}
					<View className="flex-1">
						<Text ellipsizeMode="tail" numberOfLines={1}>
							{item.title}
						</Text>
						<Text className="text-sm text-gray-500">
							{item.file_type} • {item.file_size} •{" "}
							{displayDateAsStr(item.upload_date)}
						</Text>
					</View>
				</View>
			</TouchableOpacity>
			<SharedModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			>
				<ViewResourceDialog resource={item} />
			</SharedModal>
		</>
	);
};
const styles = StyleSheet.create({
	itemContainer: {
		paddingVertical: 10,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#ddd",
	},
});

export default SingleFileItem;
