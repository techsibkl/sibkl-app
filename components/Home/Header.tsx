import { displayDateAsStr } from "@/utils/helper";
import { UserIcon } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Header = () => {
	return (
		<View className="flex-row justify-start items-center px-5 pb-5 pt-4 gap-3 shadow-sm">
			<TouchableOpacity className="">
				<View className="rounded-full p-1 bg-gray-600">
					<UserIcon size={20} color="white" />
				</View>
			</TouchableOpacity>

			<Text className="font-semibold text-xl">
				{displayDateAsStr(new Date(Date.now()))}
			</Text>
		</View>
	);
};

export default Header;
